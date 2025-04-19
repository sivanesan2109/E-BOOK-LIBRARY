import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Bookmark, Check, HighlighterIcon, Trash2, ZoomIn, ZoomOut, Book } from 'lucide-react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { FaDownload } from "react-icons/fa";
import HighlightReader from '../components/HighlightReader';
import translate from "translate";
import toast from 'react-hot-toast';




pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;

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
  note?: string;
};


const BookReader = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [userBook, setUserBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.4);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  const documentRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string>("");


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
          setPageNumber(userBookData.page);
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again later.');
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.6));
  };

  const toggleHighlightMode = () => {
    setIsHighlighting(!isHighlighting);
    if (isHighlighting) {
      setSelectedText('');
    }
  };

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
    const note = prompt("Add a note for this highlight:"); 

    const newHighlight: Highlight = {
      id: generateUniqueId(),
      pageNumber,
      text,
      position,
      color: highlightColor,
      note: note || "",
    };

    const updatedHighlights = [...highlights, newHighlight];
    setHighlights(updatedHighlights);
    saveHighlights(updatedHighlights);
    
    selection.removeAllRanges();
  };

  const removeHighlight = (highlightId: string) => {
    const updatedHighlights = highlights.filter(h => h.id !== highlightId);
    toast.error("Highlight removed sucessfully.",{
      icon: "❌",
      
    });
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
        toast.success("Highlight save sucessfully.");
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
  const editHighlightNote = (highlightId: string) => {
    const highlight = highlights.find(h => h.id === highlightId);
    if (!highlight) return;
  
    const newNote = prompt("Edit your note:", highlight.note);
    if (newNote !== null) {
      const updatedHighlights = highlights.map(h =>
        h.id === highlightId ? { ...h, note: newNote } : h
      );
      setHighlights(updatedHighlights);
      saveHighlights(updatedHighlights);
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
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = book.url;
    link.download = book.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleTextSelectionTranslate = async () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setSelectedText(selection);
      
      // Translate to Tamil
      const translated = await translate(selection, { from: "en", to: "ta" });
      setTranslatedText(translated);
    }
  };
  const saveBookmark = async (page: number) => {
    
    if (!user || !id) return;

    
    try {
      const { error } = await supabase
        .from('user_books')
        .update({ page: page })
        .eq('user_id', user.id)
        .eq('book_id', id);
        toast.success(`📚 The book page number ${page} has been marked..`);
      if (error) throw error;

      setPageNumber(page);
    } catch (error) {
      toast.error("❌ Failed to marked.");
      console.error('Error updating bookmarking:', error);
      setError('Failed to update book marking');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
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
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                  title="Choose highlight color"
                />
                <button
                  onClick={toggleHighlightMode}
                  className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isHighlighting
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <HighlighterIcon className="h-4 w-4 mr-2" />
                  {isHighlighting ? 'Highlighting...' : 'Highlight'}
                </button>
              </div>
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

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 dark:bg-gray-800 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleZoomOut}
                  className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-100 rounded-lg text-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  title="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-100 rounded-lg text-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  title="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-100">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <button
  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 
  text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg 
  hover:from-blue-500 hover:to-blue-700 active:scale-95 transition-all"
  onClick={() => saveBookmark(pageNumber)}
>
  <Bookmark className="h-5 w-5" />
  Bookmark Page {pageNumber}
</button>
              <div className="flex items-center space-x-4" id='book'>
                <button
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-100">
                  Page {pageNumber} of {numPages || '?'}
                </span>
                <button
                  onClick={() => changePage(1)}
                  disabled={numPages !== null && pageNumber >= numPages}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div onMouseUp={handleTextSelectionTranslate}>
          <div 
            ref={documentRef} 
            className="relative bg-gray-100 dark:bg-gray-800 p-4 flex justify-center"
            style={{ minHeight: '70vh' }}
            onMouseUp={handleTextSelection}
          >
            
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden" >
            
              <Document
                file={book.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                />
                
                {highlights
                  .filter((highlight) => highlight.pageNumber === pageNumber)
                  .map((highlight) => (
                    <div
                      key={highlight.id}
                      className="absolute pointer-events-none"
                      style={{
                        top: `${highlight.position.top}px`,
                        left: `${highlight.position.left}px`,
                        width: `${highlight.position.width}px`,
                        height: `${highlight.position.height}px`,
                        backgroundColor: highlight.color,
                        opacity: 0.3,
                      }}
                      title={highlight.text}
                    />
                  ))}
                  
              </Document>
              
            </div>
          </div>
          <div className="flex justify-center items-center pb-3 mt-4">
      <button
        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-all"
        onClick={handleDownload}
      >
        <FaDownload className="text-xl" />
        Download
      </button>
    </div>
    
    <HighlightReader/>
    
      
      
      {selectedText && (
        <div className="bg-gradient-to-r from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          <strong className="text-indigo-600 dark:text-indigo-400">English:</strong> {selectedText}
        </p>
        <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
          <strong className="text-green-600 dark:text-green-400">Tamil:</strong> {translatedText}
        </p>
      </div>
      
      )}
    </div>
    {/* <HighlightTranslate/>*/}
   


    
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
            <a href='#book'>
            <span
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded cursor-pointer hover:bg-gray-200 transition"
              onClick={() => setPageNumber(highlight.pageNumber)} 
            >
              Page {highlight.pageNumber}
            </span>
            </a>
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
           {/* na add pannura */}
           {highlight.note && (
    <div className="mt-2 bg-gray-100 p-2 rounded-md border-l-4 border-yellow-500 pt-4">
      <p className="text-sm text-gray-600 italic">📝 {highlight.note}</p>
    </div>
  )}

<div className="mt-2 flex gap-2 pt-4">
  <button
    onClick={() => editHighlightNote(highlight.id)}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition-transform transform hover:scale-105 duration-200"
  >
    ✏️ <span>Edit Note</span>
  </button>
</div>

        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default BookReader;