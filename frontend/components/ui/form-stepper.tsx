"use client"

import React, { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { CustomButton } from "./custom-button"

// Update the StepProps interface to include the icon property
interface StepProps {
  title: string
  description?: string
  children: React.ReactNode
  icon?: React.ReactNode  // Add this line to include the icon prop
}

interface FormStepperContextValue {
  currentStep: number
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  stepsCount: number
}

const FormStepperContext = createContext<FormStepperContextValue | undefined>(undefined)

function useFormStepper() {
  const context = useContext(FormStepperContext)
  if (!context) {
    throw new Error("useFormStepper must be used within a FormStepper")
  }
  return context
}

interface FormStepperProps {
  children: React.ReactNode
  onComplete?: () => void
  initialStep?: number
}

export function FormStepper({ children, onComplete, initialStep = 0 }: FormStepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const childrenArray = React.Children.toArray(children)
  const stepsCount = childrenArray.length

  const goToStep = (step: number) => {
    if (step >= 0 && step < stepsCount) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    if (currentStep < stepsCount - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === stepsCount - 1

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <FormStepperContext.Provider
      value={{
        currentStep,
        goToStep,
        nextStep,
        prevStep,
        isFirstStep,
        isLastStep,
        stepsCount,
      }}
    >
      <div className="space-y-8">
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-2">
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement<StepProps>(child)) {
                const stepProps = child.props
                return (
                  <div key={index} className="flex items-center">
                    {index > 0 && <div className="h-0.5 w-10 bg-gray-200" />}
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3",
                        currentStep === index
                          ? "border-primary bg-primary/5"
                          : index < currentStep
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          currentStep === index
                            ? "bg-primary text-primary-foreground"
                            : index < currentStep
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        )}
                      >
                        {index < currentStep ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          // Use the icon prop if provided, otherwise use the step number
                          stepProps.icon || <span>{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{stepProps.title}</p>
                        {stepProps.description && (
                          <p className="text-xs text-muted-foreground">{stepProps.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          {React.Children.toArray(children)[currentStep]}
        </div>

        <div className="flex justify-between">
          <CustomButton
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep}
          >
            Previous
          </CustomButton>
          {isLastStep ? (
            <CustomButton onClick={handleComplete}>Complete</CustomButton>
          ) : (
            <CustomButton onClick={nextStep}>Next</CustomButton>
          )}
        </div>
      </div>
    </FormStepperContext.Provider>
  )
}

function Step({ children, title, description }: StepProps) {
  return <div>{children}</div>
}

// Update the Step component to include the icon prop
FormStepper.Step = function Step({ children, title, description, icon }: StepProps) {
  return <div>{children}</div>
}

export { useFormStepper }
