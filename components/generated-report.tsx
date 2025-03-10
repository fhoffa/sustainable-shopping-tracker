import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VisualizeButton } from "@/components/visualize-button"

interface Recommendation {
  instruction: string;
  recipe: string;
}

interface ReportData {
  summary: string;
  sustainabilityScore: number;
  itemAnalysis: { item: string; analysis: string }[];
  recommendations: Recommendation[];
  timestamp: string;
}

interface GeneratedReportProps {
  people: string
  diet: string
  budget: string
  reportData: ReportData
  items: string[]
}

export function GeneratedReport({ people, diet, budget, reportData, items }: GeneratedReportProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shopping Report</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{people} people</Badge>
            <Badge variant="outline">{diet}</Badge>
            <Badge variant="outline">{budget} budget</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{today}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground">{reportData.summary}</p>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-2">Sustainability Score</h3>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${reportData.sustainabilityScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {reportData.sustainabilityScore}/100 - {getScoreDescription(reportData.sustainabilityScore)}
          </p>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-2">Item Analysis</h3>
          <ul className="space-y-2">
            {reportData.itemAnalysis.map((item, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{item.item}:</span> {item.analysis}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-2">Recommendations</h3>
          <ul className="space-y-4">
            {reportData.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm">
                <div className="space-y-2">
                  <p>{recommendation.instruction}</p>
                  <VisualizeButton prompt={recommendation.recipe} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function getScoreDescription(score: number): string {
  if (score >= 90) return "Excellent! Your choices today had a very low carbon footprint."
  if (score >= 80) return "Great! Your shopping choices are very sustainable."
  if (score >= 70) return "Good! You're making sustainable choices."
  if (score >= 60) return "Fair. There's room for improvement in your shopping choices."
  return "Needs improvement. Consider more sustainable options next time."
}

