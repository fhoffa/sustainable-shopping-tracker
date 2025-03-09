"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProfileSummaryProps {
  people: string
  diet: string
  budget: string
  onPeopleChange: (value: string) => void
  onDietChange: (value: string) => void
  onBudgetChange: (value: string) => void
}

export function ProfileSummary({
  people,
  diet,
  budget,
  onPeopleChange,
  onDietChange,
  onBudgetChange,
}: ProfileSummaryProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-lg font-medium mb-4">
          Shopping sustainably for
          <Select value={people} onValueChange={onPeopleChange}>
            <SelectTrigger className="w-16 h-8 mx-1 inline-flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5+">5+</SelectItem>
            </SelectContent>
          </Select>
          people, preferring
          <Select value={diet} onValueChange={onDietChange}>
            <SelectTrigger className="w-28 h-8 mx-1 inline-flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keto">keto</SelectItem>
              <SelectItem value="vegan">vegan</SelectItem>
              <SelectItem value="paleo">paleo</SelectItem>
              <SelectItem value="vegetarian">vegetarian</SelectItem>
              <SelectItem value="gluten-free">gluten-free</SelectItem>
            </SelectContent>
          </Select>
          food, with a
          <Select value={budget} onValueChange={onBudgetChange}>
            <SelectTrigger className="w-28 h-8 mx-1 inline-flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tight">tight</SelectItem>
              <SelectItem value="moderate">moderate</SelectItem>
              <SelectItem value="splurge">splurge</SelectItem>
            </SelectContent>
          </Select>
          budget
        </div>
      </CardContent>
    </Card>
  )
}

