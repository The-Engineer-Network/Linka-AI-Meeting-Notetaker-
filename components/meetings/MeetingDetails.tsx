import { FileText, Languages, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Meeting } from "@/types/meeting.types";

interface MeetingDetailsProps {
  meeting: Meeting;
}

export function MeetingDetails({ meeting }: MeetingDetailsProps) {
  const totalActions = meeting.actionItems.length;

  return (
    <div className="pt-3 border-t border-border">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="translations">
            Translations
            {meeting.translations.length > 0 && (
              <Badge variant="secondary" className="ml-1">{meeting.translations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions">
            Actions
            {totalActions > 0 && (
              <Badge variant="secondary" className="ml-1">{totalActions}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-3">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </h4>
            <p className="text-sm text-muted-foreground">{meeting.summary}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Participants</h4>
            <div className="flex flex-wrap gap-1">
              {meeting.participants.map(p => (
                <Badge key={p} variant="outline">{p}</Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{meeting.transcript}</p>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="translations">
          {meeting.translations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No translations available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meeting.translations.map((translation, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    {translation.language}
                  </h4>
                  <p className="text-sm text-muted-foreground">{translation.content}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions">
          {meeting.actionItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No action items</p>
            </div>
          ) : (
            <div className="space-y-2">
              {meeting.actionItems.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  {action.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${action.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {action.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Assigned to: {action.assignee}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}