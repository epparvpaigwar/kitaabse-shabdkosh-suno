
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadBookWithSSE, UploadProgress } from "@/services/sseUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { BookFormData } from "./types";
import { BookFormFields } from "./BookFormFields";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, CheckCircle2, FileText, Volume2, AlertCircle } from "lucide-react";

export const BookForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [bookForm, setBookForm] = useState<BookFormData>({
    title: "",
    author: "",
    language: "hindi",
    description: "",
    isPublic: true,
    pdf: null,
    cover: null,
  });

  const resetForm = () => {
    setBookForm({
      title: "",
      author: "",
      language: "hindi",
      description: "",
      isPublic: true,
      pdf: null,
      cover: null,
    });
    setUploadProgress(null);

    // Reset file inputs
    const pdfInput = document.getElementById('pdf') as HTMLInputElement;
    const coverInput = document.getElementById('cover') as HTMLInputElement;
    if (pdfInput) pdfInput.value = '';
    if (coverInput) coverInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload a book",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!bookForm.pdf) {
      toast({
        title: "PDF required",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress({
      currentPage: 0,
      totalPages: 0,
      progress: 0,
      message: "Initializing upload...",
      status: 'uploading',
    });

    try {
      console.log('Starting SSE upload process...');

      // Upload book with SSE real-time progress
      await uploadBookWithSSE(
        {
          title: bookForm.title,
          author: bookForm.author || undefined,
          description: bookForm.description || undefined,
          language: bookForm.language,
          genre: undefined,
          pdf_file: bookForm.pdf,
          cover_image: bookForm.cover || undefined,
          is_public: bookForm.isPublic,
        },
        {
          onProgress: (progress) => {
            console.log('Upload progress:', progress);
            setUploadProgress(progress);
          },
          onCompleted: (data) => {
            console.log('Upload completed:', data);
            toast({
              title: "Book uploaded successfully!",
              description: `Your book "${data.title}" has been processed and is ready to listen.`,
            });

            // Wait a moment to show completion, then navigate
            setTimeout(() => {
              resetForm();
              navigate("/library");
            }, 2000);
          },
          onError: (error) => {
            console.error('Upload error:', error);
            toast({
              title: "Upload failed",
              description: error,
              variant: "destructive",
            });
            setUploadProgress(null);
            setLoading(false);
          },
        }
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || "An unknown error occurred";

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      setUploadProgress(null);
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Upload a Book</CardTitle>
        <CardDescription>Share your favorite Hindi literature with the world</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <BookFormFields bookForm={bookForm} setBookForm={setBookForm} />

          {/* Upload Progress Display */}
          {uploadProgress && (
            <div className={`space-y-4 p-4 rounded-lg border ${
              uploadProgress.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : uploadProgress.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              {/* Stage Indicator */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  uploadProgress.status === 'completed'
                    ? 'bg-green-100'
                    : uploadProgress.status === 'error'
                    ? 'bg-red-100'
                    : uploadProgress.status === 'extracting_text'
                    ? 'bg-blue-100'
                    : uploadProgress.status === 'generating_audio'
                    ? 'bg-purple-100'
                    : 'bg-amber-100'
                }`}>
                  {uploadProgress.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : uploadProgress.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : uploadProgress.status === 'extracting_text' ? (
                    <FileText className="h-5 w-5 text-blue-600 animate-pulse" />
                  ) : uploadProgress.status === 'generating_audio' ? (
                    <Volume2 className="h-5 w-5 text-purple-600 animate-pulse" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">
                      {uploadProgress.stage?.name || 'Processing'}
                    </span>
                    {uploadProgress.totalPages > 0 && (
                      <span className="text-sm font-medium text-gray-600">
                        {uploadProgress.stage?.detail}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {uploadProgress.message}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress
                  value={uploadProgress.progress}
                  className={`h-2 ${
                    uploadProgress.status === 'completed' ? '[&>div]:bg-green-500' :
                    uploadProgress.status === 'error' ? '[&>div]:bg-red-500' :
                    uploadProgress.status === 'extracting_text' ? '[&>div]:bg-blue-500' :
                    uploadProgress.status === 'generating_audio' ? '[&>div]:bg-purple-500' :
                    ''
                  }`}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {uploadProgress.status === 'uploading' && 'Preparing upload...'}
                    {uploadProgress.status === 'extracting_text' && 'Extracting text from PDF...'}
                    {uploadProgress.status === 'generating_audio' && 'Converting text to speech...'}
                    {uploadProgress.status === 'completed' && 'All done!'}
                    {uploadProgress.status === 'error' && 'Upload failed'}
                  </span>
                  <span className="font-medium">{uploadProgress.progress}%</span>
                </div>
              </div>

              {/* Audio Stats (shown during audio generation) */}
              {uploadProgress.audioStats && uploadProgress.status === 'generating_audio' && (
                <div className="flex gap-4 text-xs pt-2 border-t border-amber-200">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-gray-600">Generated: {uploadProgress.audioStats.generated}</span>
                  </div>
                  {uploadProgress.audioStats.skipped > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="text-gray-600">Skipped: {uploadProgress.audioStats.skipped}</span>
                    </div>
                  )}
                  {uploadProgress.audioStats.failed > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-gray-600">Failed: {uploadProgress.audioStats.failed}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Completion Stats */}
              {uploadProgress.status === 'completed' && uploadProgress.audioStats && (
                <div className="flex flex-wrap gap-3 text-xs pt-2 border-t border-green-200">
                  <div className="flex items-center gap-1.5 bg-green-100 px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-700 font-medium">{uploadProgress.audioStats.generated} audio files</span>
                  </div>
                  {uploadProgress.audioStats.currentDuration && uploadProgress.audioStats.currentDuration > 0 && (
                    <div className="flex items-center gap-1.5 bg-purple-100 px-2 py-1 rounded-full">
                      <Volume2 className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-700 font-medium">
                        {Math.floor(uploadProgress.audioStats.currentDuration / 60)}m {Math.round(uploadProgress.audioStats.currentDuration % 60)}s total
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                {uploadProgress?.status === 'completed' ? (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {uploadProgress?.status === 'uploading' && 'Uploading...'}
                {uploadProgress?.status === 'extracting_text' && `Extracting Text (${uploadProgress.progress}%)`}
                {uploadProgress?.status === 'generating_audio' && `Generating Audio (${uploadProgress.progress}%)`}
                {uploadProgress?.status === 'completed' && 'Completed! Redirecting...'}
                {uploadProgress?.status === 'error' && 'Upload Failed'}
                {!uploadProgress?.status && 'Processing...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload Book
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
