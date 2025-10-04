"use client"

import { Card } from "../ui/Card"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import { Gift, Copy } from "lucide-react"

const ReferralPanel = ({ showReferral, referralCode, setReferralCode }) => {
  if (!showReferral) return null

  return (
    <Card className="p-6 bg-gradient-to-r from-white to-emerald-50 border border-green-100 rounded-2xl shadow">
      <div className="text-center">
        <Gift className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-700 mb-2">Refer Friends & Earn Rewards!</h3>
        <p className="text-green-600 mb-4">Get ₹100 for every friend who books through your referral</p>
        <div className="flex gap-4 max-w-md mx-auto">
          <Input
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="rounded-xl border border-green-200 bg-gray-50"
          />
          <Button className="rounded-xl bg-green-500 hover:bg-green-600 text-white">Apply Code</Button>
        </div>
        <div className="mt-4 p-3 bg-white rounded-xl border border-green-100">
          <p className="text-sm text-gray-600">
            Your referral code: <span className="font-mono font-bold text-green-600">JOHN2024</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-10 rounded-full bg-transparent border-green-200 text-green-700"
            onClick={() => navigator.clipboard.writeText("JOHN2024")}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ReferralPanel
