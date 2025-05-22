"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FormStepper } from "@/components/ui/form-stepper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomButton } from "@/components/ui/custom-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, User, MapPin, Factory, FileCheck, Upload } from "lucide-react"
import { VerificationBadge } from "@/components/ui/verification-badge"
import Link from "next/link"

// Form schemas for each step
const companyInfoSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  companyType: z.string().min(1, { message: "Please select a company type" }),
  registrationNumber: z.string().min(1, { message: "Registration number is required" }),
  foundingYear: z.string().regex(/^\d{4}$/, { message: "Please enter a valid year" }),
  description: z.string().optional(),
});

const contactInfoSchema = z.object({
  contactName: z.string().min(2, { message: "Contact name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional(),
});

const addressSchema = z.object({
  streetAddress: z.string().min(5, { message: "Street address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  state: z.string().min(2, { message: "State must be at least 2 characters" }),
  postalCode: z.string().min(5, { message: "Postal code must be at least 5 characters" }),
  country: z.string().min(2, { message: "Country must be at least 2 characters" }),
});

const manufacturingInfoSchema = z.object({
  productCategories: z.string().min(1, { message: "Please select at least one product category" }),
  certifications: z.string().optional(),
  productionCapacity: z.string().optional(),
  manufacturingFacilities: z.string().min(1, { message: "Please provide manufacturing facilities information" }),
});

const verificationSchema = z.object({
  acceptTerms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions" }),
  acceptPrivacyPolicy: z.boolean().refine(val => val === true, { message: "You must accept the privacy policy" }),
});

export default function ManufacturerRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationStatus, setRegistrationStatus] = useState<"unknown" | "pending" | "verified" | "rejected">("unknown");
  
  // Form state for each step
  const companyInfoForm = useForm<z.infer<typeof companyInfoSchema>>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: "",
      companyType: "",
      registrationNumber: "",
      foundingYear: "",
      description: "",
    },
  });

  const contactInfoForm = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      contactName: "",
      email: "",
      phone: "",
      website: "",
    },
  });

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      streetAddress: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const manufacturingInfoForm = useForm<z.infer<typeof manufacturingInfoSchema>>({
    resolver: zodResolver(manufacturingInfoSchema),
    defaultValues: {
      productCategories: "",
      certifications: "",
      productionCapacity: "",
      manufacturingFacilities: "",
    },
  });

  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacyPolicy: false,
    },
  });

  const handleComplete = async () => {
    // Combine all form data
    const formData = {
      ...companyInfoForm.getValues(),
      ...contactInfoForm.getValues(),
      ...addressForm.getValues(),
      ...manufacturingInfoForm.getValues(),
      ...verificationForm.getValues(),
    };

    console.log("Registration complete:", formData);
    
    // Update status to pending
    setRegistrationStatus("pending");
    
    // In a real application, you would submit this data to your API
    // await fetch('/api/register/manufacturer', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update status to verified (in a real app, this would come from the API response)
    setRegistrationStatus("verified");
    
    // Redirect to success page or dashboard after a short delay to show the status change
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header showWalletConnect={false} />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Manufacturer Registration</h1>
            <p className="text-muted-foreground">Join our supply chain network as a verified manufacturer</p>
            {registrationStatus !== "unknown" && (
              <div className="mt-4 flex justify-center">
                <VerificationBadge 
                  variant={registrationStatus} 
                  className="text-base px-3 py-1" 
                />
              </div>
            )}
          </div>

          <Card className="mx-auto max-w-4xl">
            <CardContent className="p-6">
              <FormStepper onComplete={handleComplete} initialStep={currentStep}>
                <FormStepper.Step title="Company Information" description="Basic company details" icon={<Building2 className="h-5 w-5" />}>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="Enter your company name"
                        {...companyInfoForm.register("companyName")}
                      />
                      {companyInfoForm.formState.errors.companyName && (
                        <p className="text-sm text-red-500">{companyInfoForm.formState.errors.companyName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyType">Company Type</Label>
                      <Select
                        onValueChange={(value) => companyInfoForm.setValue("companyType", value)}
                        defaultValue={companyInfoForm.getValues("companyType")}
                      >
                        <SelectTrigger id="companyType">
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="soleProprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {companyInfoForm.formState.errors.companyType && (
                        <p className="text-sm text-red-500">{companyInfoForm.formState.errors.companyType.message}</p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input
                          id="registrationNumber"
                          placeholder="Enter registration number"
                          {...companyInfoForm.register("registrationNumber")}
                        />
                        {companyInfoForm.formState.errors.registrationNumber && (
                          <p className="text-sm text-red-500">{companyInfoForm.formState.errors.registrationNumber.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foundingYear">Founding Year</Label>
                        <Input
                          id="foundingYear"
                          placeholder="YYYY"
                          {...companyInfoForm.register("foundingYear")}
                        />
                        {companyInfoForm.formState.errors.foundingYear && (
                          <p className="text-sm text-red-500">{companyInfoForm.formState.errors.foundingYear.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Company Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your company"
                        className="min-h-[100px]"
                        {...companyInfoForm.register("description")}
                      />
                    </div>
                  </form>
                </FormStepper.Step>

                <FormStepper.Step title="Contact Information" description="Primary contact details" icon={<User className="h-5 w-5" />}>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name</Label>
                      <Input
                        id="contactName"
                        placeholder="Enter contact person's name"
                        {...contactInfoForm.register("contactName")}
                      />
                      {contactInfoForm.formState.errors.contactName && (
                        <p className="text-sm text-red-500">{contactInfoForm.formState.errors.contactName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        {...contactInfoForm.register("email")}
                      />
                      {contactInfoForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{contactInfoForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        {...contactInfoForm.register("phone")}
                      />
                      {contactInfoForm.formState.errors.phone && (
                        <p className="text-sm text-red-500">{contactInfoForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        placeholder="https://example.com"
                        {...contactInfoForm.register("website")}
                      />
                      {contactInfoForm.formState.errors.website && (
                        <p className="text-sm text-red-500">{contactInfoForm.formState.errors.website.message}</p>
                      )}
                    </div>
                  </form>
                </FormStepper.Step>

                <FormStepper.Step title="Address Information" description="Location details" icon={<MapPin className="h-5 w-5" />}>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        placeholder="Enter street address"
                        {...addressForm.register("streetAddress")}
                      />
                      {addressForm.formState.errors.streetAddress && (
                        <p className="text-sm text-red-500">{addressForm.formState.errors.streetAddress.message}</p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Enter city"
                          {...addressForm.register("city")}
                        />
                        {addressForm.formState.errors.city && (
                          <p className="text-sm text-red-500">{addressForm.formState.errors.city.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          placeholder="Enter state or province"
                          {...addressForm.register("state")}
                        />
                        {addressForm.formState.errors.state && (
                          <p className="text-sm text-red-500">{addressForm.formState.errors.state.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="Enter postal code"
                          {...addressForm.register("postalCode")}
                        />
                        {addressForm.formState.errors.postalCode && (
                          <p className="text-sm text-red-500">{addressForm.formState.errors.postalCode.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="Enter country"
                          {...addressForm.register("country")}
                        />
                        {addressForm.formState.errors.country && (
                          <p className="text-sm text-red-500">{addressForm.formState.errors.country.message}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </FormStepper.Step>

                <FormStepper.Step title="Manufacturing Information" description="Production capabilities" icon={<Factory className="h-5 w-5" />}>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productCategories">Product Categories</Label>
                      <Select
                        onValueChange={(value) => manufacturingInfoForm.setValue("productCategories", value)}
                        defaultValue={manufacturingInfoForm.getValues("productCategories")}
                      >
                        <SelectTrigger id="productCategories">
                          <SelectValue placeholder="Select primary product category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="food">Food & Beverages</SelectItem>
                          <SelectItem value="textiles">Textiles & Apparel</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                          <SelectItem value="chemicals">Chemicals</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {manufacturingInfoForm.formState.errors.productCategories && (
                        <p className="text-sm text-red-500">{manufacturingInfoForm.formState.errors.productCategories.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications (Optional)</Label>
                      <Textarea
                        id="certifications"
                        placeholder="List any relevant certifications (ISO, GMP, etc.)"
                        className="min-h-[80px]"
                        {...manufacturingInfoForm.register("certifications")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productionCapacity">Production Capacity (Optional)</Label>
                      <Textarea
                        id="productionCapacity"
                        placeholder="Describe your production capacity"
                        className="min-h-[80px]"
                        {...manufacturingInfoForm.register("productionCapacity")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manufacturingFacilities">Manufacturing Facilities</Label>
                      <Textarea
                        id="manufacturingFacilities"
                        placeholder="Describe your manufacturing facilities"
                        className="min-h-[100px]"
                        {...manufacturingInfoForm.register("manufacturingFacilities")}
                      />
                      {manufacturingInfoForm.formState.errors.manufacturingFacilities && (
                        <p className="text-sm text-red-500">{manufacturingInfoForm.formState.errors.manufacturingFacilities.message}</p>
                      )}
                    </div>
                  </form>
                </FormStepper.Step>

                <FormStepper.Step title="Verification" description="Final verification" icon={<FileCheck className="h-5 w-5" />}>
                  <form className="space-y-6">
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h3 className="mb-2 font-medium">Verification Requirements</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        To complete your registration, please review and accept our terms and conditions.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="acceptTerms" 
                            checked={verificationForm.watch("acceptTerms")}
                            onCheckedChange={(checked) => 
                              verificationForm.setValue("acceptTerms", checked === true)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="acceptTerms"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              I accept the terms and conditions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              By checking this box, you agree to our{" "}
                              <Link href="/terms" className="text-primary underline">
                                Terms of Service
                              </Link>
                              .
                            </p>
                          </div>
                        </div>
                        {verificationForm.formState.errors.acceptTerms && (
                          <p className="text-sm text-red-500">{verificationForm.formState.errors.acceptTerms.message}</p>
                        )}

                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="acceptPrivacyPolicy" 
                            checked={verificationForm.watch("acceptPrivacyPolicy")}
                            onCheckedChange={(checked) => 
                              verificationForm.setValue("acceptPrivacyPolicy", checked === true)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="acceptPrivacyPolicy"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              I accept the privacy policy
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              By checking this box, you agree to our{" "}
                              <Link href="/privacy" className="text-primary underline">
                                Privacy Policy
                              </Link>
                              .
                            </p>
                          </div>
                        </div>
                        {verificationForm.formState.errors.acceptPrivacyPolicy && (
                          <p className="text-sm text-red-500">{verificationForm.formState.errors.acceptPrivacyPolicy.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h3 className="mb-2 font-medium">Document Upload</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Optional: Upload supporting documents to expedite your verification process.
                      </p>
                      
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 10MB)</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" />
                        </label>
                      </div>
                    </div>
                  </form>
                </FormStepper.Step>
              </FormStepper>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}