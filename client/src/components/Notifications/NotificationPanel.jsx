"use client"

import { Button } from "../ui/Button"
import { X } from "lucide-react"

const NotificationPanel = ({ showNotifications, setShowNotifications, notifications }) => {
  if (!showNotifications) return null

  return (
    <div className="fixed top-20 right-6 w-80 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(false)}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === "success"
                    ? "bg-green-500"
                    : notification.type === "info"
                      ? "bg-blue-500"
                      : "bg-orange-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full rounded-xl bg-transparent">
          View All Notifications
        </Button>
      </div>
    </div>
  )
}

export default NotificationPanel
