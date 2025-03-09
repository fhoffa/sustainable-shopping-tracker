"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface PreviousReport {
  id: number
  date: string
  people: string
  diet: string
  budget: string
  sustainabilityScore: number
  summary: string
}

interface PreviousReportsProps {
  reports: PreviousReport[]
}

export function PreviousReports({ reports }: PreviousReportsProps) {
  const [expandedReport, setExpandedReport] = useState<number | null>(null)

  const toggleReport = (id: number) => {
    if (expandedReport === id) {
      setExpandedReport(null)
    } else {
      setExpandedReport(id)
    }
  }

  if (reports.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
              onClick={() => toggleReport(report.id)}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{report.date}</span>
                <div className="hidden sm:flex gap-2">
                  <Badge variant="outline">{report.people} people</Badge>
                  <Badge variant="outline">{report.diet}</Badge>
                  <Badge variant="outline">{report.budget}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <span className="text-sm mr-2">Score: {report.sustainabilityScore}</span>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${report.sustainabilityScore}%` }}
                    ></div>
                  </div>
                </div>
                {expandedReport === report.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>

            {expandedReport === report.id && (
              <div className="p-4 border-t bg-muted/20">
                <div className="sm:hidden flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{report.people} people</Badge>
                  <Badge variant="outline">{report.diet}</Badge>
                  <Badge variant="outline">{report.budget}</Badge>
                </div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground mb-4">{report.summary}</p>

                <Separator className="my-3" />

                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    View Full Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

