"use client"

import { Button } from "../ui/Button"
import { MessageCircle, ArrowUp } from "lucide-react"

const FloatingActionButtons = ({ setShowChat }) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
      {/* Chat Support */}
      <Button
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        onClick={() => setShowChat(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Scroll to Top */}
      <Button
        variant="outline"
        className="w-14 h-14 rounded-full bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
    </div>
  )
}

export default FloatingActionButtons