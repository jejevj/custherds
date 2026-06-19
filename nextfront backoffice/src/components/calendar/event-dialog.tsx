"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarEvent } from "./types"
import { useEffect, useState } from "react"

import {
  CalendarDays,
  MapPin,
  Trash2,
} from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


type Props = {
  open: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  event?: CalendarEvent | null
  selectedDate?: string | null
}

export function EventDialog({
  open,
  onClose,
  onSave,
  event,
  selectedDate,
}: Props) {
  const [eventType, setEventType] = useState("meeting")
const [location, setLocation] = useState("")

const eventColors = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
]

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [color, setColor] = useState("#3b82f6")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description ?? "")
      setStart(event.start)
      setEnd(event.end ?? "")
      setColor(event.color ?? "#3b82f6")
    } else if (selectedDate) {
      setTitle("")
      setDescription("")
      setStart(`${selectedDate}T09:00`)
      setEnd(`${selectedDate}T09:30`)
      setColor("#3b82f6")
    }
  }, [event, selectedDate])

  const handleSave = () => {
    onSave({
      id: event?.id ?? crypto.randomUUID(),
      title,
      description,
      start,
      end,
      color,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
  <DialogHeader>
    <DialogTitle className="flex items-center gap-2">
      <CalendarDays className="h-5 w-5" />
      {event ? "Edit Event" : "Create Event"}
    </DialogTitle>
  </DialogHeader>

  <div className="space-y-5">

    {/* Title */}
    <div className="space-y-2">
      <Label>Event Title</Label>
      <Input
        placeholder="Team Meeting"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>

    {/* Description */}
    <div className="space-y-2">
      <Label>Description</Label>
      <Textarea
        placeholder="Add event details..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>

    {/* Event Type + Location */}
    <div className="grid grid-cols-2 gap-4">

      <div className="space-y-2">
        <Label>Event Type</Label>
        <Select
          value={eventType}
          onValueChange={setEventType}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">
              Meeting
            </SelectItem>
            <SelectItem value="task">
              Task
            </SelectItem>
            <SelectItem value="holiday">
              Holiday
            </SelectItem>
            <SelectItem value="reminder">
              Reminder
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Conference Room"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

    </div>

    {/* Date Time */}
    <div className="grid grid-cols-2 gap-4">

      <div className="space-y-2">
        <Label>Start</Label>
        <Input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>End</Label>
        <Input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

    </div>

    {/* Color Presets */}
    <div className="space-y-2">
      <Label>Color</Label>

      <div className="flex gap-3">
        {eventColors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-8 w-8 rounded-full border-2 transition-all ${
              color === c
                ? "scale-110 border-white"
                : "border-transparent"
            }`}
            style={{
              backgroundColor: c,
            }}
          />
        ))}
      </div>
    </div>

    {/* Preview */}
    <div
      className="rounded-xl border bg-card/50 p-4"
      style={{
        borderLeft: `4px solid ${color}`,
      }}
    >
      <p className="font-medium">
        {title || "Untitled Event"}
      </p>

      <p className="text-sm text-muted-foreground mt-1">
        {eventType.charAt(0).toUpperCase() +
          eventType.slice(1)}
      </p>

      {location && (
        <p className="text-sm text-muted-foreground">
          📍 {location}
        </p>
      )}

      {start && (
        <p className="text-sm text-muted-foreground">
          {new Date(start).toLocaleString()}
        </p>
      )}
    </div>

  </div>

  <DialogFooter className="border-t pt-4">

    {event && (
      <Button
        variant="destructive"
        className="mr-auto"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    )}

    <Button
      variant="outline"
      onClick={onClose}
    >
      Cancel
    </Button>

    <Button
      onClick={handleSave}
      disabled={!title || !start}
    >
      {event ? "Update Event" : "Create Event"}
    </Button>

  </DialogFooter>
</DialogContent>
    </Dialog>
  )
}
