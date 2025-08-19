'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { queryTemplates } from '@/lib/llm/query-templates';
import { QueryErrorBoundary } from '@/components/error-boundary';

interface QueryRunnerProps {
  projectId: string;
  onQueryComplete?: () => void;
}

export function QueryRunner({ projectId, onQueryComplete }: QueryRunnerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');

  const handleRunQuery = async (type: 'template' | 'custom') => {
    if (type === 'template' && !selectedTemplate) {
      toast.error('Please select a query template');
      return;
    }
    if (type === 'custom' && !customQuery.trim()) {
      toast.error('Please enter a custom query');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/queries/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          provider,
          ...(type === 'template'
            ? { templateId: selectedTemplate }
            : { customQuery }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute query');
      }

      const result = await response.json();

      toast.success(
        `Query completed! Found ${result.summary.totalMentions} mentions.`,
        {
          description: `${result.summary.sentiment.positive} positive, ${result.summary.sentiment.neutral} neutral, ${result.summary.sentiment.negative} negative`,
        }
      );

      // Clear form
      if (type === 'custom') {
        setCustomQuery('');
      }

      // Callback to refresh data
      onQueryComplete?.();
    } catch (error) {
      console.error('Query execution error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to execute query'
      );
    } finally {
      setLoading(false);
    }
  };

  // Group templates by category
  const templatesByCategory = queryTemplates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, typeof queryTemplates>
  );

  return (
    <QueryErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Run Brand Analysis
          </CardTitle>
          <CardDescription>
            Execute queries to find how your brand is mentioned in AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Provider</label>
              <Select
                value={provider}
                onValueChange={v => setProvider(v as typeof provider)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Query Tabs */}
            <Tabs defaultValue="templates">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Query Templates</TabsTrigger>
                <TabsTrigger value="custom">Custom Query</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select a Template
                  </label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a query template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templatesByCategory).map(
                        ([category, templates]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </div>
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                <div className="flex items-center gap-2">
                                  <span>{template.name}</span>
                                  {template.effectiveness && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {template.effectiveness}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      {
                        queryTemplates.find(t => t.id === selectedTemplate)
                          ?.description
                      }
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleRunQuery('template')}
                  disabled={loading || !selectedTemplate}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Query...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Template Query
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Query</label>
                  <Textarea
                    placeholder="Enter your custom query, e.g., 'What are the best project management tools for remote teams?'"
                    value={customQuery}
                    onChange={e => setCustomQuery(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={() => handleRunQuery('custom')}
                  disabled={loading || !customQuery.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Query...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Custom Query
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </QueryErrorBoundary>
  );
}
