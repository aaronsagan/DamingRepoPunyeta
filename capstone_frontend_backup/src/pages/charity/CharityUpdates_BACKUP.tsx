import { useState, useEffect } from "react";
import { Heart, MessageCircle, MoreVertical, Trash2, Edit2, Loader2, Pin, PinOff, Image as ImageIcon, Send, Plus, X, Info, MapPin, TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { updatesService } from "@/services/updates";
import { charityService } from "@/services/charity";

interface Update {
  id: number;
  charity_id: number;
  parent_id: number | null;
  content: string;
  media_urls: string[];
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  charity?: { id: number; name: string; logo_path?: string; };
  children?: Update[];
  is_liked?: boolean;
}

interface Comment {
  id: number;
  update_id: number;
  user_id: number;
  content: string;
  created_at: string;
  is_hidden: boolean;
  user?: { id: number; name: string; role: string; };
}

export default function CharityUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [charityData, setCharityData] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUpdateContent, setNewUpdateContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [threadingParentId, setThreadingParentId] = useState<number | null>(null);
  const [threadContent, setThreadContent] = useState("");
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { loadCharityData(); fetchUpdates(); }, []);

  const loadCharityData = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      if (res.ok) { 
        const me = await res.json(); 
        setCharityData(me?.charity);
        // Load stats if charity exists
        if (me?.charity?.id) {
          try {
            const statsData = await charityService.getDashboardStats(me.charity.id);
            setStats(statsData);
          } catch (err) {
            console.error('Failed to load stats:', err);
          }
        }
      }
    } catch (error) { console.error('Failed to load charity data:', error); }
  };

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const data = await updatesService.getMyUpdates();
      const updatesList = data.data || data;
      const organized = organizeThreads(updatesList);
      setUpdates(organized);
    } catch (error) {
      toast.error('Failed to load updates');
      console.error('Error fetching updates:', error);
    } finally { setLoading(false); }
  };

  const organizeThreads = (updatesList: Update[]): Update[] => {
    const updateMap = new Map<number, Update>();
    const rootUpdates: Update[] = [];
    updatesList.forEach(update => { updateMap.set(update.id, { ...update, children: [] }); });
    updatesList.forEach(update => {
      const updateWithChildren = updateMap.get(update.id)!;
      if (update.parent_id) {
        const parent = updateMap.get(update.parent_id);
        if (parent) { parent.children = parent.children || []; parent.children.push(updateWithChildren); }
        else { rootUpdates.push(updateWithChildren); }
      } else { rootUpdates.push(updateWithChildren); }
    });
    return rootUpdates.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 4) { toast.error('Maximum 4 images allowed'); return; }
    setSelectedImages([...selectedImages, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreviews(prev => [...prev, reader.result as string]); };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateUpdate = async (parentId: number | null = null) => {
    const content = parentId ? threadContent : newUpdateContent;
    if (!content.trim()) { toast.error('Please enter some content'); return; }
    setCreating(true);
    try {
      await updatesService.createUpdate({ content, parent_id: parentId || undefined, media: parentId ? undefined : selectedImages });
      if (parentId) { setThreadContent(""); setThreadingParentId(null); }
      else { setNewUpdateContent(""); setSelectedImages([]); setImagePreviews([]); setIsCreateModalOpen(false); }
      toast.success('Update posted successfully!');
      fetchUpdates();
    } catch (error: any) {
      console.error('Error creating update:', error);
      toast.error(error.response?.data?.message || 'Failed to create update');
    } finally { setCreating(false); }
  };

  const handleEdit = async () => {
    if (!editingUpdate || !editContent.trim()) return;
    try {
      await updatesService.updateUpdate(editingUpdate.id, editContent);
      toast.success('Update edited successfully');
      setIsEditModalOpen(false); setEditingUpdate(null); fetchUpdates();
    } catch (error) { toast.error('Failed to edit update'); console.error('Error editing update:', error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this update? This will also delete all threaded replies.")) return;
    try {
      await updatesService.deleteUpdate(id);
      toast.success("Update deleted successfully");
      fetchUpdates();
    } catch (error) { toast.error('Failed to delete update'); console.error('Error deleting update:', error); }
  };

  const handleTogglePin = async (id: number, currentlyPinned: boolean) => {
    try {
      await updatesService.togglePin(id);
      toast.success(currentlyPinned ? 'Update unpinned' : 'Update pinned to top');
      fetchUpdates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update pin status');
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleLike = async (updateId: number) => {
    try {
      const result = await updatesService.toggleLike(updateId);
      const updateInState = (items: Update[]): Update[] => {
        return items.map(update => {
          if (update.id === updateId) { return { ...update, is_liked: result.liked, likes_count: result.likes_count }; }
          if (update.children) { return { ...update, children: updateInState(update.children) }; }
          return update;
        });
      };
      setUpdates(prev => updateInState(prev));
    } catch (error) { toast.error('Failed to like update'); console.error('Error toggling like:', error); }
  };

  const fetchComments = async (updateId: number) => {
    if (loadingComments.has(updateId)) return;
    setLoadingComments(prev => new Set(prev).add(updateId));
    try {
      const data = await updatesService.getComments(updateId);
      setComments(prev => ({ ...prev, [updateId]: data.data || data }));
    } catch (error) { console.error('Error fetching comments:', error); }
    finally { setLoadingComments(prev => { const next = new Set(prev); next.delete(updateId); return next; }); }
  };

  const handleToggleComments = (updateId: number) => {
    const isExpanded = expandedComments.has(updateId);
    if (isExpanded) { setExpandedComments(prev => { const next = new Set(prev); next.delete(updateId); return next; }); }
    else { setExpandedComments(prev => new Set(prev).add(updateId)); if (!comments[updateId]) { fetchComments(updateId); } }
  };

  const handleAddComment = async (updateId: number) => {
    const content = newComment[updateId];
    if (!content?.trim()) return;
    try {
      const newCommentData = await updatesService.addComment(updateId, content);
      setComments(prev => ({ ...prev, [updateId]: [...(prev[updateId] || []), newCommentData] }));
      setNewComment(prev => ({ ...prev, [updateId]: '' }));
      const updateCounts = (items: Update[]): Update[] => {
        return items.map(update => {
          if (update.id === updateId) { return { ...update, comments_count: update.comments_count + 1 }; }
          if (update.children) { return { ...update, children: updateCounts(update.children) }; }
          return update;
        });
      };
      setUpdates(prev => updateCounts(prev));
      toast.success('Comment added');
    } catch (error) { toast.error('Failed to add comment'); console.error('Error adding comment:', error); }
  };

  const handleDeleteComment = async (updateId: number, commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await updatesService.deleteComment(commentId);
      setComments(prev => ({ ...prev, [updateId]: prev[updateId].filter(c => c.id !== commentId) }));
      const updateCounts = (items: Update[]): Update[] => {
        return items.map(update => {
          if (update.id === updateId) { return { ...update, comments_count: Math.max(0, update.comments_count - 1) }; }
          if (update.children) { return { ...update, children: updateCounts(update.children) }; }
          return update;
        });
      };
      setUpdates(prev => updateCounts(prev));
      toast.success('Comment deleted');
    } catch (error) { toast.error('Failed to delete comment'); console.error('Error deleting comment:', error); }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderUpdate = (update: Update, depth: number = 0): JSX.Element => {
    const isThreaded = depth > 0;
    const hasThread = (update.children?.length || 0) > 0;
    const isExpanded = expandedComments.has(update.id);
    const updateComments = comments[update.id] || [];
    return (<div key={update.id} className={isThreaded ? "ml-12 relative" : ""}>{isThreaded && (<div className="absolute left-[-24px] top-0 bottom-0 w-0.5 bg-border" />)}<Card className={`${isThreaded ? "mt-3" : "mb-4"} hover:shadow-md transition-shadow`}><CardHeader className="pb-3"><div className="flex items-start justify-between"><div className="flex items-start gap-3 flex-1"><Avatar className="h-10 w-10"><AvatarImage src={charityData?.logo_path ? `${import.meta.env.VITE_API_URL}/storage/${charityData.logo_path}` : ""} /><AvatarFallback>{charityData?.name?.substring(0, 2).toUpperCase() || 'CH'}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-semibold text-sm">{charityData?.name || 'Your Charity'}</p>{update.is_pinned && (<Badge variant="secondary" className="flex items-center gap-1 text-xs"><Pin className="h-3 w-3" />Pinned</Badge>)}</div><p className="text-xs text-muted-foreground">{formatTimeAgo(update.created_at)}</p></div></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingUpdate(update); setEditContent(update.content); setIsEditModalOpen(true); }}><Edit2 className="mr-2 h-4 w-4" />Edit Post</DropdownMenuItem>{!update.parent_id && (<DropdownMenuItem onClick={() => handleTogglePin(update.id, update.is_pinned)}>{update.is_pinned ? (<><PinOff className="mr-2 h-4 w-4" />Unpin from Top</>) : (<><Pin className="mr-2 h-4 w-4" />Pin to Top</>)}</DropdownMenuItem>)}{!hasThread && (<DropdownMenuItem onClick={() => setThreadingParentId(update.id)}><Plus className="mr-2 h-4 w-4" />Add to Update</DropdownMenuItem>)}<Separator className="my-1" /><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(update.id)}><Trash2 className="mr-2 h-4 w-4" />Delete Post</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></CardHeader><CardContent className="space-y-3 pt-0"><p className="whitespace-pre-wrap text-sm leading-relaxed">{update.content}</p>{update.media_urls && update.media_urls.length > 0 && (<div className={`grid gap-2 rounded-lg overflow-hidden ${update.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>{update.media_urls.map((url, index) => (<img key={index} src={`${import.meta.env.VITE_API_URL}/storage/${url}`} alt={`Update media ${index + 1}`} className="rounded-md w-full object-cover max-h-80 cursor-pointer hover:opacity-90 transition-opacity" />))}</div>)}{(update.likes_count > 0 || update.comments_count > 0) && (<div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">{update.likes_count > 0 && (<span>{update.likes_count} {update.likes_count === 1 ? 'like' : 'likes'}</span>)}{update.comments_count > 0 && (<span>{update.comments_count} {update.comments_count === 1 ? 'comment' : 'comments'}</span>)}</div>)}<Separator /><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="flex-1 h-9" onClick={() => handleToggleLike(update.id)}><Heart className={`mr-2 h-4 w-4 ${update.is_liked ? 'fill-red-500 text-red-500' : ''}`} />Like</Button><Button variant="ghost" size="sm" className="flex-1 h-9" onClick={() => handleToggleComments(update.id)}><MessageCircle className="mr-2 h-4 w-4" />Comment</Button></div>{isExpanded && (<><Separator /><div className="space-y-3 pt-2">{loadingComments.has(update.id) ? (<div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>) : (<>{updateComments.length > 0 && (<ScrollArea className="max-h-60 pr-4"><div className="space-y-3">{updateComments.map(comment => (<div key={comment.id} className="flex gap-2"><Avatar className="h-7 w-7 mt-0.5"><AvatarFallback className="text-xs">{comment.user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="bg-muted rounded-2xl px-3 py-2"><p className="font-semibold text-xs">{comment.user?.name || 'User'}</p><p className="text-sm">{comment.content}</p></div><div className="flex items-center gap-3 mt-1 px-3"><span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span><Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive" onClick={() => handleDeleteComment(update.id, comment.id)}>Delete</Button></div></div></div>))}</div></ScrollArea>)}<div className="flex gap-2 pt-2"><Avatar className="h-7 w-7 mt-1"><AvatarImage src={charityData?.logo_path ? `${import.meta.env.VITE_API_URL}/storage/${charityData.logo_path}` : ""} /><AvatarFallback className="text-xs">{charityData?.name?.substring(0, 2).toUpperCase() || 'CH'}</AvatarFallback></Avatar><div className="flex-1 flex gap-2"><input type="text" placeholder="Write a comment..." value={newComment[update.id] || ''} onChange={(e) => setNewComment(prev => ({ ...prev, [update.id]: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && handleAddComment(update.id)} className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary" /><Button size="sm" onClick={() => handleAddComment(update.id)} disabled={!newComment[update.id]?.trim()} className="rounded-full"><Send className="h-4 w-4" /></Button></div></div></>)}</div></>)}</CardContent></Card>{threadingParentId === update.id && (<Card className="ml-12 mt-3 border-2 border-primary/50 shadow-sm"><CardContent className="pt-4 space-y-3"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Plus className="h-4 w-4" /><span>Adding to this update</span></div><Textarea placeholder="Continue the update..." value={threadContent} onChange={(e) => setThreadContent(e.target.value)} rows={3} className="resize-none" autoFocus /><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => { setThreadingParentId(null); setThreadContent(""); }}>Cancel</Button><Button size="sm" onClick={() => handleCreateUpdate(update.id)} disabled={!threadContent.trim() || creating}>{creating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</>) : (<><Send className="mr-2 h-4 w-4" />Post Update</>)}</Button></div></CardContent></Card>)}{update.children && update.children.length > 0 && (<div className="space-y-0">{update.children.map(child => renderUpdate(child, depth + 1))}</div>)}</div>);
  };

  if (loading) { return (<div className="max-w-2xl mx-auto px-4 py-8"><div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /><p className="text-muted-foreground">Loading updates...</p></div></div>); }

  return (<div className="max-w-2xl mx-auto px-4 py-6 pb-24"><div className="mb-6"><h1 className="text-3xl font-bold">Updates</h1><p className="text-muted-foreground text-sm mt-1">Share your impact with supporters</p></div><div className="space-y-0">{updates.map((update) => renderUpdate(update, 0))}</div>{updates.length === 0 && (<Card className="p-12 text-center border-dashed"><div className="flex flex-col items-center"><div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><MessageCircle className="h-8 w-8 text-primary" /></div><h3 className="font-semibold text-lg mb-2">No updates yet</h3><p className="text-muted-foreground text-sm mb-6 max-w-sm">Share your first update to keep your supporters informed about your work and impact.</p><Button onClick={() => setIsCreateModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Create Your First Update</Button></div></Card>)}<Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50" onClick={() => setIsCreateModalOpen(true)}><Plus className="h-6 w-6" /></Button><Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}><DialogContent className="sm:max-w-[600px]"><DialogHeader><DialogTitle>Create New Update</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="flex items-start gap-3"><Avatar className="h-10 w-10"><AvatarImage src={charityData?.logo_path ? `${import.meta.env.VITE_API_URL}/storage/${charityData.logo_path}` : ""} /><AvatarFallback>{charityData?.name?.substring(0, 2).toUpperCase() || 'CH'}</AvatarFallback></Avatar><div className="flex-1"><p className="font-semibold text-sm">{charityData?.name || 'Your Charity'}</p><p className="text-xs text-muted-foreground">Posting to your supporters</p></div></div><Textarea placeholder="Share an update with your supporters..." value={newUpdateContent} onChange={(e) => setNewUpdateContent(e.target.value)} rows={6} className="resize-none text-base" autoFocus />{imagePreviews.length > 0 && (<div className="grid grid-cols-2 gap-2">{imagePreviews.map((preview, index) => (<div key={index} className="relative group"><img src={preview} alt={`Preview ${index + 1}`} className="rounded-lg w-full h-32 object-cover" /><Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}><X className="h-4 w-4" /></Button></div>))}</div>)}<div className="flex items-center justify-between pt-2"><div><input type="file" id="update-images-modal" accept="image/*" multiple className="hidden" onChange={handleImageSelect} disabled={selectedImages.length >= 4} /><label htmlFor="update-images-modal"><Button variant="outline" size="sm" asChild disabled={selectedImages.length >= 4}><span className="cursor-pointer"><ImageIcon className="mr-2 h-4 w-4" />Add Photos ({selectedImages.length}/4)</span></Button></label></div><Button onClick={() => handleCreateUpdate()} disabled={!newUpdateContent.trim() || creating}>{creating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</>) : (<><Send className="mr-2 h-4 w-4" />Post Update</>)}</Button></div></div></DialogContent></Dialog><Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}><DialogContent><DialogHeader><DialogTitle>Edit Update</DialogTitle></DialogHeader><Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} className="resize-none" /><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleEdit} disabled={!editContent.trim()}>Save Changes</Button></div></DialogContent></Dialog></div>);
}
