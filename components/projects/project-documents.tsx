"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  FileText,
  Download,
  Eye,
  Loader2,
  Upload,
  File,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileCode,
} from "lucide-react"

// Mock API call - replace with actual API call
import { useGetProjectDocumentsQuery } from "@/redux/features/projects/projectsAPISlice"

interface ProjectDocumentsProps {
  projectId: number | string
}

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const { data: documents = [], isLoading } = useGetProjectDocumentsQuery(String(projectId))
  const [searchTerm, setSearchTerm] = useState("")

  // Filter documents based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FilePdf className="h-6 w-6 text-red-500" />
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
        return <FileImage className="h-6 w-6 text-blue-500" />
      case "excel":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />
      case "code":
      case "json":
      case "html":
        return <FileCode className="h-6 w-6 text-purple-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading documents...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Project Documents</h2>
          <p className="text-gray-500">Files and documentation related to this project</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search documents..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "No documents match your search criteria. Try a different search term."
                : "No documents have been uploaded for this project yet."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Upload className="mr-2 h-4 w-4" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-gray-50 p-6 flex items-center justify-center md:w-24">
                  {getFileIcon(document.file_type)}
                </div>
                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{document.title}</CardTitle>
                        <CardDescription>
                          {document.file_type.toUpperCase()} • {document.file_size} • Uploaded{" "}
                          {new Date(document.uploaded_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">{document.category || "General"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{document.description}</p>

                    <div className="flex items-center text-sm text-gray-500">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=24&width=24&query=${encodeURIComponent(document.uploaded_by.username)}`}
                        />
                        <AvatarFallback className="text-xs">
                          {document.uploaded_by.first_name?.[0]}
                          {document.uploaded_by.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        Uploaded by {document.uploaded_by.first_name} {document.uploaded_by.last_name}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
