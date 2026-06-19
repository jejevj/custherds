"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { EventDialog } from "./event-dialog"
import { CalendarEvent } from "./types"

export default function ShadcnFullCalendar() {
  const calendarRef = useRef<FullCalendar>(null)

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: "1", title: "Product Launch", start: "2026-02-15" },
    { id: "2", title: "10a Client Meeting", start: "2026-02-18" },
  ])

  const [currentView, setCurrentView] =
    useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null)

  const changeView = (view: typeof currentView) => {
    calendarRef.current?.getApi().changeView(view)
    setCurrentView(view)
  }

  return (
    <>
      {/* 🔝 Custom Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => calendarRef.current?.getApi().prev()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => calendarRef.current?.getApi().next()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => calendarRef.current?.getApi().today()}
          >
            Today
          </Button>
        </div>

        {/* Center Title */}
        <h2 className="text-lg font-semibold">
          {calendarRef.current?.getApi().view.title}
        </h2>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            className={
  currentView === "dayGridMonth"
    ? "bg-card/60 border-border backdrop-blur-sm text-primary"
    : "bg-muted/30 border-border backdrop-blur-sm"
}
            onClick={() => changeView("dayGridMonth")}
          >
            Month
          </Button>
          <Button
            variant={currentView === "timeGridWeek" ? "default" : "outline"}
            onClick={() => changeView("timeGridWeek")}
          >
            Week
          </Button>
          <Button
            variant={currentView === "timeGridDay" ? "default" : "outline"}
            onClick={() => changeView("timeGridDay")}
          >
            Day
          </Button>

          <Button
            onClick={() => {
              setSelectedEvent(null)
              setSelectedDate(new Date().toISOString().slice(0, 10))
              setDialogOpen(true)
            }}
          >
            + Add Event
          </Button>
        </div>
      </div>

      {/* 📅 Calendar */}
     <div
  className="
    rounded-2xl
    border border-border
    bg-card/40
    backdrop-blur-xl
    p-4
  "
>
  <FullCalendar
    ref={calendarRef}
    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
    initialView={currentView}
    headerToolbar={false}
    height="auto"
    events={events}
    editable
    selectable
    datesSet={(arg) => setCurrentView(arg.view.type as any)}
    dateClick={(info) => {
      setSelectedDate(info.dateStr)
      setSelectedEvent(null)
      setDialogOpen(true)
    }}
    eventClick={(info) => {
      const ev = events.find((e) => e.id === info.event.id)

      if (ev) {
        setSelectedEvent(ev)
        setDialogOpen(true)
      }
    }}
    eventDidMount={(info) => {
      const { description } = info.event.extendedProps

      if (description) {
        info.el.title = description
      }
    }}
  />
</div>


      {/* 🧩 Dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        selectedDate={selectedDate}
        event={selectedEvent}
        onSave={(event) => {
          setEvents((prev) => {
            const exists = prev.find((e) => e.id === event.id)
            return exists
              ? prev.map((e) => (e.id === event.id ? event : e))
              : [...prev, event]
          })
        }}
      />
    </>
  )
}
