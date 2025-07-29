 "use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search,
  Calendar,
  Heart,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, getCurrentUser, JournalEntry } from "@/lib/supabase";
import Link from "next/link";

interface JournalSectionProps {
  onActivityLogged?: (activityType: string, description: string) => void;
}

export const JournalSection = ({ onActivityLogged }: JournalSectionProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");

  const moods = [
    { value: "happy", label: "😊 Happy", color: "text-green-500" },
    { value: "sad", label: "😢 Sad", color: "text-blue-500" },
    { value: "excited", label: "🎉 Excited", color: "text-yellow-500" },
    { value: "calm", label: "😌 Calm", color: "text-purple-500" },
    { value: "anxious", label: "😰 Anxious", color: "text-orange-500" },
    { value: "neutral", label: "😐 Neutral", color: "text-gray-500" },
  ];

  // Load current user and entries
  useEffect(() => {
    const loadUserAndEntries = async () => {
      try {
        console.log("Journal: Starting to load user...");
        const { user, error } = await getCurrentUser();
        console.log("Journal: Loading user, user:", user, "error:", error);
        
        if (error) {
          console.error("Error loading user:", error);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          console.log("Journal: No user found, setting loading to false");
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
        
        console.log("Journal: User found, setting current user");
        setCurrentUser(user);
        
        console.log("Journal: Loading entries for user:", user.id);
        await loadEntries(user.id);
        
      } catch (error) {
        console.error("Error in loadUserAndEntries:", error);
        setCurrentUser(null);
      } finally {
        console.log("Journal: Setting loading to false");
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure Supabase is initialized
    const timer = setTimeout(() => {
      loadUserAndEntries();
    }, 100);

    return () => clearTimeout(timer);
  }, []);



  const loadEntries = async (userId: string) => {
    try {
      console.log("Journal: Loading entries for user:", userId);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading entries:", error);
        return;
      }

      console.log("Journal: Loaded entries:", data);
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const entry: Partial<JournalEntry> = {
        user_id: currentUser.id,
        title: title.trim(),
        content: content.trim(),
        mood: mood || null,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      };

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error("Error creating entry:", error);
        return;
      }

      setEntries([data, ...entries]);
      resetForm();
      setIsCreating(false);
      
      // Log activity
      if (onActivityLogged) {
        onActivityLogged("journal_entry", `Created journal entry: ${title.trim()}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const updatedEntry = {
        title: title.trim(),
        content: content.trim(),
        mood: mood || null,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('journal_entries')
        .update(updatedEntry)
        .eq('id', editingEntry.id);

      if (error) {
        console.error("Error updating entry:", error);
        return;
      }

      setEntries(entries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, ...updatedEntry }
          : entry
      ));
      
      resetForm();
      setEditingEntry(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error("Error deleting entry:", error);
        return;
      }

      setEntries(entries.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const startEditing = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || "");
    setTags(entry.tags?.join(', ') || "");
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMood("");
    setTags("");
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading journal...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Personal Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              Please log in to access your journal.
            </p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Personal Journal
          </CardTitle>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {(isCreating || editingEntry) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingEntry ? "Edit Entry" : "New Entry"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry} className="space-y-4">
                <Input
                  placeholder="Entry title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <Textarea
                  placeholder="Write your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mood</label>
                  <div className="grid grid-cols-3 gap-2">
                    {moods.map((moodOption) => (
                      <button
                        key={moodOption.value}
                        type="button"
                        onClick={() => setMood(moodOption.value)}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          mood === moodOption.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {moodOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    placeholder="mindfulness, gratitude, reflection..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {editingEntry ? "Update Entry" : "Save Entry"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "No entries match your search." : "No journal entries yet. Start writing!"}
            </p>
          ) : (
            filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{entry.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {entry.created_at && formatDate(entry.created_at)}
                      </div>
                      {entry.mood && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {moods.find(m => m.value === entry.mood)?.label}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(entry)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id!)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground whitespace-pre-wrap">
                  {entry.content}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};