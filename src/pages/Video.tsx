
import { FaPlay, FaPause } from "react-icons/fa";

import { ChevronLeft, Bookmark, Check, Trash2, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


type Highlight = {
    id: string;
    pageNumber: number;
    text: string;
    position: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    color: string;
  };
export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
   const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [book, setBook] = useState<any>(null);
    const [userBook, setUserBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [highlightColor, setHighlightColor] = useState('#ffeb3b');
    const documentRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
    }
  };
   useEffect(() => {
      const fetchBookData = async () => {
        try {
          if (!id || !user) return;
  
          const { data: bookData, error: bookError } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();
  
          if (bookError) throw bookError;
          setBook(bookData);
  
          const { data: userBookData, error: userBookError } = await supabase
            .from('user_books')
            .select('*')
            .eq('user_id', user.id)
            .eq('book_id', id)
            .single();
  
          if (userBookError && userBookError.code !== 'PGRST116') {
            throw userBookError;
          }
  
          if (userBookData) {
            setUserBook(userBookData);
            setHighlights(userBookData.highlights || []);
          } else {
            const { data: newUserBook, error: createError } = await supabase
              .from('user_books')
              .insert([
                {
                  user_id: user.id,
                  book_id: id,
                  read: false,
                  highlights: [],
                },
              ])
              .select()
              .single();
  
            if (createError) throw createError;
            setUserBook(newUserBook);
          }
        } catch (error) {
          console.error('Error fetching book data:', error);
          // setError('Failed to load book data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchBookData();
    }, [id, user]);
  
  
  
    const generateUniqueId = () => {
      return Math.random().toString(36).substr(2, 9);
    };
  
    const handleTextSelection = () => {
      if (!isHighlighting) return;
  
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
  
      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();
      
      if (!text) return;
  
      const rect = range.getBoundingClientRect();
      const docRect = documentRef.current?.getBoundingClientRect();
      
      if (!docRect) return;
  
      const position = {
        top: rect.top - docRect.top,
        left: rect.left - docRect.left,
        width: rect.width,
        height: rect.height,
      };
  
      const newHighlight: Highlight = {
        id: generateUniqueId(),
        pageNumber,
        text,
        position,
        color: highlightColor,
      };
  
      const updatedHighlights = [...highlights, newHighlight];
      setHighlights(updatedHighlights);
      saveHighlights(updatedHighlights);
      
      selection.removeAllRanges();
    };
  
    const removeHighlight = (highlightId: string) => {
      const updatedHighlights = highlights.filter(h => h.id !== highlightId);
      setHighlights(updatedHighlights);
      saveHighlights(updatedHighlights);
    };
  
    const saveHighlights = async (highlightsToSave: Highlight[]) => {
      if (!user || !id) return;
  
      try {
        const { error } = await supabase
          .from('user_books')
          .update({ highlights: highlightsToSave })
          .eq('user_id', user.id)
          .eq('book_id', id);
  
        if (error) throw error;
      } catch (error) {
        console.error('Error saving highlights:', error);
        setError('Failed to save highlights');
      }
    };
  
    const markAsRead = async () => {
      if (!user || !id) return;
  
      try {
        const { error } = await supabase
          .from('user_books')
          .update({ read: !userBook?.read })
          .eq('user_id', user.id)
          .eq('book_id', id);
  
        if (error) throw error;
  
        setUserBook({ ...userBook, read: !userBook?.read });
      } catch (error) {
        console.error('Error updating read status:', error);
        setError('Failed to update read status');
      }
    };
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      );
    }
  
    if (!book) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <Book className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-2xl font-semibold text-gray-700 mb-4">Book not found</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Library
          </button>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6 space-y-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back to Library
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
          <div className="flex flex-wrap gap-3">
            
            <button
              onClick={markAsRead}
              className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                userBook?.read
                  ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              {userBook?.read ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Read
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Mark as Read
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              
             
            </div>
          </div>
        </div>

        {error && (
          <div className="m-4">
            <div className="bg-red-50 dark:bg-gray-700 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div 
          ref={documentRef} 
          className="relative bg-gray-100 dark:bg-gray-700 p-4 flex justify-center"
          style={{ minHeight: '70vh' }}
          onMouseUp={handleTextSelection}
        >
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            {/* Video file */}
            <video
          ref={videoRef}
          className="w-full rounded-lg shadow-lg border-4 border-gray-700"
          controls
        >
          <source src={book.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
          >
            {playing ? <FaPause /> : <FaPlay />}
            {playing ? "Pause" : "Play"}
          </button>
        </div>
          </div>
        </div>
        
  
      </div>

      {highlights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm mt-6 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Highlights</h3>
          <div className="grid gap-4">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    Page {highlight.pageNumber}
                  </span>
                  <button
                    onClick={() => removeHighlight(highlight.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Remove highlight"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center mt-3">
                  <div
                    className="w-4 h-4 rounded-full mr-3 border border-gray-200"
                    style={{ backgroundColor: highlight.color }}
                  />
                  <p className="text-gray-700 font-medium">"{highlight.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
