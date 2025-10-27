import { useState } from "react";
import { Image as ImageIcon, Upload, Trash2, Play, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

interface MediaTabProps {
  mediaItems: any[];
  setMediaItems: (items: any[]) => void;
  markAsChanged: () => void;
  charityId?: number;
}

export default function MediaTab({ mediaItems, setMediaItems, markAsChanged, charityId }: MediaTabProps) {
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    
    try {
      const newItems = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image',
        file: file,
        name: file.name
      }));

      setMediaItems([...mediaItems, ...newItems]);
      toast.success(`${files.length} file(s) uploaded`);
      markAsChanged();
    } catch (error) {
      toast.error("Failed to upload media");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = (id: number) => {
    if (window.confirm("Are you sure you want to delete this media?")) {
      setMediaItems(mediaItems.filter(m => m.id !== id));
      toast.success("Media deleted");
      markAsChanged();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Media Gallery
              </CardTitle>
              <CardDescription>
                Showcase your organization's work through images and videos
              </CardDescription>
            </div>
            <div>
              <input
                type="file"
                id="media-upload"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
                disabled={uploadingMedia}
              />
              <label htmlFor="media-upload">
                <Button asChild disabled={uploadingMedia}>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingMedia ? "Uploading..." : "Upload Media"}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mediaItems.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No media uploaded yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload images or videos to showcase your organization's impact
              </p>
              <label htmlFor="media-upload">
                <Button asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Media
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-75" />
                      <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          {selectedMedia && (
            <div className="mt-8">
              {selectedMedia.type === 'video' ? (
                <video src={selectedMedia.url} controls className="w-full rounded-lg" />
              ) : (
                <img src={selectedMedia.url} alt="Media" className="w-full rounded-lg" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
