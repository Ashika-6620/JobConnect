export interface JobType {
  id: number
  title: string
  company: string
  companyLogo?: string
  location: string
  remote: boolean
  type: string
  salary: string
  description: string
  tags: string[]
}
