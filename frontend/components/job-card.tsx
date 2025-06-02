import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, MapPin, Clock, Building2 } from "lucide-react"
import Link from "next/link"
import type { JobType } from "@/lib/types"

interface JobCardProps {
  job: JobType
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4 overflow-hidden">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo || "/placeholder.svg"}
                    alt={job.company}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <Link href={`/jobs/${job.id}`}>
                  <h3 className="font-semibold text-lg hover:text-green-600 transition-colors">{job.title}</h3>
                </Link>
                <p className="text-gray-500 text-sm">{job.company}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-green-600">
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
              {job.remote && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Remote
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {job.type}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                {tag}
              </Badge>
            ))}
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100">
        <div className="text-green-600 font-medium">${job.salary}</div>
        <Link href={`/jobs/${job.id}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
