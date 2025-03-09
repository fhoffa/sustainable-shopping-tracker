"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, FileText, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProfileSummary } from "@/components/profile-summary"
import { ImageUpload } from "@/components/image-upload"
import { GeneratedReport } from "@/components/generated-report"
import { PreviousReports } from "@/components/previous-reports"
import { generateShoppingReport } from "@/app/actions/generate-report"
import { useToast } from "@/hooks/use-toast"

interface ShoppingItem {
  image: string
  label: string
}

export function ShoppingSession() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [people, setPeople] = useState("2")
  const [diet, setDiet] = useState("keto")
  const [budget, setBudget] = useState("splurge")
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previousReports, setPreviousReports] = useState([])
  const { toast } = useToast()

  // Load previous reports from localStorage on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem("previousReports")
    if (savedReports) {
      setPreviousReports(JSON.parse(savedReports))
    }
  }, [])

  const handleImageUpload = (image: string, label: string) => {
    setItems([...items, { image, label }])
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const generateReport = async () => {
    try {
      setIsGenerating(true)

      // Call the server action with profile data and items
      const result = await generateShoppingReport(
        items.map((item) => item.label), // Send item labels instead of just images
        { people, diet, budget },
      )

      if (result.success) {
        setReportData(result)
        setShowReport(true)

        // Save report to local storage for previous reports
        const newReport = {
          id: Date.now(),
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          people,
          diet,
          budget,
          sustainabilityScore: result.sustainabilityScore,
          summary: result.summary,
          items: items.map((item) => item.label),
        }

        const updatedReports = [newReport, ...previousReports].slice(0, 10)
        setPreviousReports(updatedReports)
        localStorage.setItem("previousReports", JSON.stringify(updatedReports))

        toast({
          title: "Report Generated",
          description: "Your sustainability report has been created successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate report. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Report generation error:", error)
      toast({
        title: "Error",
        description: "Something went wrong while generating the report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const startNewSession = () => {
    setItems([])
    setShowReport(false)
    setReportData(null)
    toast({
      title: "New Session",
      description: "Started a new shopping session.",
    })
  }

  return (
    <div className="space-y-6">
      <ProfileSummary
        people={people}
        diet={diet}
        budget={budget}
        onPeopleChange={setPeople}
        onDietChange={setDiet}
        onBudgetChange={setBudget}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Session</CardTitle>
          <Button variant="outline" size="sm" onClick={startNewSession}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border group">
                <img src={item.image || "/placeholder.svg"} alt={item.label} className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <button onClick={() => removeItem(index)} className="self-end bg-red-500 rounded-full p-1">
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <div className="bg-black/60 text-white p-1 text-sm font-medium">{item.label}</div>
                </div>
              </div>
            ))}
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={generateReport} disabled={isGenerating || items.length === 0}>
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating with Groq..." : "Generate Report"}
          </Button>
        </CardFooter>
      </Card>

      {showReport && reportData && (
        <GeneratedReport
          people={people}
          diet={diet}
          budget={budget}
          reportData={reportData}
          items={items.map((item) => item.label)}
        />
      )}

      <PreviousReports reports={previousReports} />
    </div>
  )
}

