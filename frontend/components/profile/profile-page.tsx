"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Edit, LogOut, Settings, Shield, User } from "lucide-react"

export interface UserActivity {
  id: string
  type: string
  description: string
  date: string
  metadata?: Record<string, any>
}

export interface UserWallet {
  id: string
  name: string
  address: string
  balance: number
  currency: string
  isDefault?: boolean
}

export interface ProfilePageProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    bio?: string
    joinDate: string
    role?: string
    verified?: boolean
    twoFactorEnabled?: boolean
  }
  wallets?: UserWallet[]
  activities?: UserActivity[]
  stats?: {
    transactions: number
    products: number
    reputation: number
  }
  onEditProfile?: () => void
  onLogout?: () => void
  onSettingsClick?: () => void
  className?: string
}

export function ProfilePage({
  user,
  wallets = [],
  activities = [],
  stats = { transactions: 0, products: 0, reputation: 0 },
  onEditProfile,
  onLogout,
  onSettingsClick,
  className,
}: ProfilePageProps) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="relative">
          <div className="absolute right-6 top-6 flex gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={onEditProfile}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit Profile
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={onSettingsClick}
              leftIcon={<Settings className="h-4 w-4" />}
            >
              Settings
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={onLogout}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Logout
            </CustomButton>
          </div>
          
          <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-4 text-center sm:mt-0 sm:text-left">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                {user.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {user.role && (
                  <Badge>{user.role}</Badge>
                )}
              </div>
              <CardDescription>{user.email}</CardDescription>
              <p className="mt-2 text-sm text-muted-foreground">
                Member since {user.joinDate}
              </p>
              {user.bio && <p className="mt-4 text-sm">{user.bio}</p>}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border p-4">
              <span className="text-2xl font-bold">{stats.transactions}</span>
              <span className="text-sm text-muted-foreground">Transactions</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-4">
              <span className="text-2xl font-bold">{stats.products}</span>
              <span className="text-sm text-muted-foreground">Products</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border p-4">
              <span className="text-2xl font-bold">{stats.reputation}</span>
              <span className="text-sm text-muted-foreground">Reputation</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="wallets">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallets" className="mt-4 space-y-4">
          {wallets.length > 0 ? (
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <Card key={wallet.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{wallet.name}</CardTitle>
                      {wallet.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm text-muted-foreground">
                        {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                      </p>
                      <p className="font-medium">
                        {wallet.balance} {wallet.currency}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <CustomButton variant="outline" size="sm">
                      View Details
                    </CustomButton>
                    <CustomButton variant="outline" size="sm">
                      Copy Address
                    </CustomButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Wallets</CardTitle>
                <CardDescription>You haven't connected any wallets yet.</CardDescription>
              </CardHeader>
              <CardFooter>
                <CustomButton>Connect Wallet</CustomButton>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
          {activities.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Activity</CardTitle>
                <CardDescription>You don't have any recent activity.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <CustomButton variant={user.twoFactorEnabled ? "outline" : "default"}>
                  {user.twoFactorEnabled ? "Disable" : "Enable"}
                </CustomButton>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Change your password regularly for better security
                  </p>
                </div>
                <CustomButton variant="outline">Change Password</CustomButton>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Active Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage your active sessions across devices
                  </p>
                </div>
                <CustomButton variant="outline">View Sessions</CustomButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}