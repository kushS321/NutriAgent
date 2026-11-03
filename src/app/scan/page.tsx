'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  Barcode,
  Search,
  Upload,
  Sparkles,
  FileText,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';
import { AssessmentEngine } from '@/lib/assessment/rulesEngine';
import { ExtractedProduct } from '@/types/nutrition';
const zxingControlsRef = useRef<{ stop: () => void } | null>(null);
import { BrowserMultiFormatReader } from '@zxing/browser';

function FoodScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode') || 'barcode';

  const [activeTab, setActiveTab] = useState<'barcode' | 'search' | 'upload' | 'manual'>(
    initialMode === 'manual' ? 'manual' : initialMode === 'upload' ? 'upload' : 'barcode'
  );

  // Barcode Scanning State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Search by Name State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExtractedProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Image Upload / OCR State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualServingSize, setManualServingSize] = useState('1 serving (40g)');
  const [manualCalories, setManualCalories] = useState('');
  const [manualSodium, setManualSodium] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualSugars, setManualSugars] = useState('');
  const [manualAddedSugars, setManualAddedSugars] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualSatFat, setManualSatFat] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualIngredients, setManualIngredients] = useState('');
  const [manualAllergenWarning, setManualAllergenWarning] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lookupFailureBarcode, setLookupFailureBarcode] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
  const video = videoRef.current;
  if (cameraActive && video && mediaStreamRef.current) {
    video.srcObject = mediaStreamRef.current;
    video.muted = true;
    video.play().catch(() => {});

    // NEW: fallback for browsers without native BarcodeDetector
    if (!('BarcodeDetector' in window)) {
      const reader = new BrowserMultiFormatReader();
      reader
        .decodeFromVideoElement(video, (result) => {
          if (result) {
            stopCamera();
            handleLookupBarcode(result.getText());
          }
        })
        .then((controls) => {
          zxingControlsRef.current = controls;
        })
        .catch((err) => console.warn('ZXing error:', err));
    }
  }
}, [cameraActive]);



  // --- CAMERA BARCODE SCANNER ---
  const stopCamera = () => {
    // NEW: stop the ZXing fallback scanner
    zxingControlsRef.current?.stop();
    zxingControlsRef.current = null;

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this device/browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      setCameraActive(true);

      // Check if native BarcodeDetector API is supported
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue;
                stopCamera();
                handleLookupBarcode(detectedCode);
              }
            } catch (detectErr) {
              // Ignore single-frame detection errors
            }
          }
        }, 350);
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      const errObj = err as Error;
      if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera access was denied. Please allow camera permissions in your browser or type the barcode manually below.'
        );
      } else {
        setCameraError('Unable to access camera. Please enter barcode number or upload a label photo.');
      }
    }
  };

  // --- BARCODE LOOKUP ---
  const handleLookupBarcode = async (codeToLookup?: string) => {
    const targetBarcode = (codeToLookup || barcodeInput).trim();
    if (!targetBarcode) {
      setErrorMessage('Please enter a barcode number.');
      return;
    }

    setIsLookingUpBarcode(true);
    setErrorMessage(null);
    setLookupFailureBarcode(null);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(targetBarcode)}`);
      if (!res.ok) {
        setLookupFailureBarcode(targetBarcode);
        throw new Error(
          `Product not found in Open Food Facts database for barcode "${targetBarcode}".`
        );
      }

      const data = await res.json();
      const product: ExtractedProduct = data.product;

      // Assess against current user profile
      const profile = UserRepository.getProfile();
      const assessment = AssessmentEngine.assess(product, profile);

      UserRepository.setActiveProduct(product);
      UserRepository.setActiveAssessment(assessment);
      UserRepository.saveAssessment(assessment);

      router.push(`/results/${product.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error resolving product barcode.');
    } finally {
      setIsLookingUpBarcode(false);
    }
  };

  // --- PRODUCT SEARCH BY NAME ---
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.products || []);
      if (!data.products || data.products.length === 0) {
        setErrorMessage(`No products found matching "${query}". Try searching by another brand name or scan its barcode.`);
      }
    } catch (err) {
      setErrorMessage('Error searching products. Please check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (product: ExtractedProduct) => {
    const profile = UserRepository.getProfile();
    const assessment = AssessmentEngine.assess(product, profile);

    UserRepository.setActiveProduct(product);
    UserRepository.setActiveAssessment(assessment);
    UserRepository.saveAssessment(assessment);

    router.push(`/results/${product.id}`);
  };

  // --- LABEL IMAGE UPLOAD & OCR ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 8MB. Please select a smaller photo.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzePhoto = async () => {
    if (!previewUrl) {
      setErrorMessage('Please select or capture a food label photo first.');
      return;
    }

    setIsProcessingOcr(true);
    setErrorMessage(null);
    setProcessingStep('Preparing image for food-label OCR recognition...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Extracting ingredients list, allergens, and Nutrition Facts...');

      const response = await fetch('/api/ocr/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
        }),
      });

      setProcessingStep('Structuring per-100g and per-serving nutrients...');
      await new Promise((r) => setTimeout(r, 500));

      if (!response.ok) {
        throw new Error('Failed to extract food label text from image.');
      }

      const data = await response.json();
      const extractedProduct: ExtractedProduct = data.product;

      // Persist active product for human review screen
      UserRepository.setActiveProduct(extractedProduct);
      router.push('/review');
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || 'Error processing food label.');
      setIsProcessingOcr(false);
    }
  };

  // --- MANUAL PRODUCT ENTRY ---
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      setErrorMessage('Please enter a product name.');
      return;
    }

    const manualProduct: ExtractedProduct = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      brand: manualBrand.trim() || undefined,
      ingredientsText: manualIngredients.trim() || 'No ingredients entered.',
      parsedIngredients: manualIngredients
        .split(/[,;]/)
        .map((i) => i.trim())
        .filter(Boolean),
      allergenWarningText: manualAllergenWarning.trim() || undefined,
      nutrition: {
        servingSize: manualServingSize || '1 serving',
        servingBasis: 'per_serving',
        calories: manualCalories ? parseFloat(manualCalories) : undefined,
        sodiumMg: manualSodium ? parseFloat(manualSodium) : undefined,
        totalCarbohydratesG: manualCarbs ? parseFloat(manualCarbs) : undefined,
        totalSugarsG: manualSugars ? parseFloat(manualSugars) : undefined,
        addedSugarsG: manualAddedSugars ? parseFloat(manualAddedSugars) : undefined,
        totalFatG: manualFat ? parseFloat(manualFat) : undefined,
        saturatedFatG: manualSatFat ? parseFloat(manualSatFat) : undefined,
        dietaryFiberG: manualFiber ? parseFloat(manualFiber) : undefined,
        proteinG: manualProtein ? parseFloat(manualProtein) : undefined,
      },
      ocrConfidence: 100,
      uncertainFields: [],
      scannedAt: new Date().toISOString(),
      isSampleData: false,
      provenance: 'user_manual',
    };

    UserRepository.setActiveProduct(manualProduct);
    router.push('/review');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#254F75]" />
          <span>Product Scanner & Evaluation Engine</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-coffee-950 tracking-tight">
          Check a Packaged Food
        </h1>
        <p className="text-xs sm:text-sm text-coffee-600">
          Scan a barcode, search by product name, or upload a package photo to answer:{' '}
          <span className="font-bold text-coffee-950">“Can I Eat This?”</span>
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center overflow-x-auto no-scrollbar pb-1">
        <div className="bg-beige-200/90 p-1 rounded-2xl inline-flex gap-1 border border-beige-300 shadow-subtle">
          <button
            onClick={() => {
              setActiveTab('barcode');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'barcode'
                ? 'bg-white text-coffee-950 shadow-subtle'
                : 'text-coffee-700 hover:text-coffee-950'
            }`}
          >
            <Barcode className="w-4 h-4 text-pencil-sage-600" />
            <span>Scan Barcode</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('search');
              stopCamera();
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-white text-coffee-950 shadow-subtle'
                : 'text-coffee-700 hover:text-coffee-950'
            }`}
          >
            <Search className="w-4 h-4 text-pencil-blue-600" />
            <span>Search by Name</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-coffee-950 shadow-subtle'
                : 'text-coffee-700 hover:text-coffee-950'
            }`}
          >
            <Upload className="w-4 h-4 text-pencil-peach-600" />
            <span>Upload Label OCR</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manual');
              stopCamera();
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-coffee-950 shadow-subtle'
                : 'text-coffee-700 hover:text-coffee-950'
            }`}
          >
            <FileText className="w-4 h-4 text-coffee-600" />
            <span>Manual Input</span>
          </button>
        </div>
      </div>

      {/* Error & Lookup Recovery Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col gap-2 text-xs text-red-900 shadow-subtle">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block text-red-950">Lookup Notice</strong>
              <p>{errorMessage}</p>
            </div>
          </div>

          {lookupFailureBarcode && (
            <div className="mt-2 pt-2 border-t border-red-200 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-red-800">Available Fallbacks:</span>
              <button
                onClick={() => setActiveTab('search')}
                className="btn-pencil-blue py-1 px-3 text-[11px]"
              >
                Search by Product Name
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className="btn-pencil-peach py-1 px-3 text-[11px]"
              >
                Upload Label Photo (OCR)
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className="btn-pencil-brown py-1 px-3 text-[11px]"
              >
                Enter Label Manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: BARCODE SCANNER */}
      {activeTab === 'barcode' && (
        <div className="space-y-6">
          {/* Live Camera Viewfinder */}
          {cameraActive ? (
            <div className="bg-coffee-950 rounded-3xl overflow-hidden shadow-card p-4 relative flex flex-col items-center">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                className="w-full max-h-[380px] object-cover rounded-2xl"
              />
              <div className="absolute top-10 left-8 right-8 pointer-events-none border-2 border-dashed border-pencil-sage-400 rounded-2xl h-48 flex items-center justify-center">
                <span className="text-[11px] font-medium text-white/95 bg-coffee-950/80 px-3 py-1 rounded-full backdrop-blur-sm">
                  Align Barcode (EAN-13 / UPC) inside box
                </span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={stopCamera} className="btn-pencil-peach text-xs py-2 px-5">
                  Cancel Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="card-warm bg-white border border-beige-300 p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E4F1E9] border border-[#A7D1B7] flex items-center justify-center mx-auto text-[#275A3A]">
                <Camera className="w-8 h-8 text-[#275A3A]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-serif font-bold text-coffee-950">
                  Scan Barcode with Device Camera
                </h3>
                <p className="text-xs text-coffee-600">
                  Point your phone or webcam at the barcode on any packaged food box or wrapper.
                </p>
              </div>

              {cameraError && (
                <p className="text-xs text-pencil-peach-700 bg-pencil-peach-50 p-2.5 rounded-xl border border-pencil-peach-200 max-w-md mx-auto">
                  {cameraError}
                </p>
              )}

              <button
                onClick={startCamera}
                className="btn-pencil-sage text-xs py-2.5 px-6 font-semibold shadow-warm"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Scanner</span>
              </button>
            </div>
          )}

          {/* Manual Barcode Number Form */}
          <div className="card-warm bg-white border border-beige-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-coffee-700" />
              <div>
                <h3 className="text-sm font-serif font-bold text-coffee-950">
                  Or Type Barcode Number Manually
                </h3>
                <p className="text-xs text-coffee-500">
                  Enter the 8, 12, or 13-digit code printed beneath the barcode stripes.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookupBarcode();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="e.g. 8901058852461 (Maggi) or 8901262010053 (Amul Butter)"
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
              />
              <button
                type="submit"
                disabled={!barcodeInput.trim() || isLookingUpBarcode}
                className="btn-pencil-brown text-xs py-2.5 px-5 font-bold disabled:opacity-50"
              >
                {isLookingUpBarcode ? 'Looking up...' : 'Lookup'}
              </button>
            </form>
          </div>

          {/* One-Click Real Product Samples for Testing */}
          <div className="card-warm bg-[#FAF8F5] border border-beige-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-coffee-900">
                Quick Test Products (Instant Verified Data)
              </span>
              <span className="text-[11px] text-coffee-500">Click to evaluate</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {SAMPLE_PRODUCTS.slice(0, 6).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLookupBarcode(sample.barcode)}
                  className="p-3 bg-white rounded-xl border border-beige-200 hover:border-coffee-400 text-left transition-all shadow-subtle group"
                >
                  <div className="font-semibold text-xs text-coffee-900 group-hover:text-coffee-950 line-clamp-1">
                    {sample.name}
                  </div>
                  <div className="text-[10px] text-coffee-500 mt-0.5 flex items-center justify-between">
                    <span>{sample.brand || 'Packaged Food'}</span>
                    <span className="font-mono">{sample.barcode}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEARCH BY NAME */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="card-warm bg-white border border-beige-200 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-coffee-950">
                Search Open Food Facts Database
              </h3>
              <p className="text-xs text-coffee-500">
                Search over 3 million verified food packages by brand or product title.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Britannia Good Day, Amul Butter, Maggi, Epigamia..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className="btn-pencil-blue text-xs py-2.5 px-5 font-bold disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="card-warm bg-white border border-beige-200 p-5 space-y-3">
              <h4 className="text-xs font-semibold text-coffee-700">
                Found {searchResults.length} Products:
              </h4>
              <div className="divide-y divide-beige-100">
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className="py-3 flex items-center justify-between hover:bg-beige-50 rounded-xl px-2 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-coffee-950">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-coffee-500 flex items-center gap-2 mt-0.5">
                        <span>{prod.brand || 'Brand unlisted'}</span>
                        <span>•</span>
                        <span>{prod.nutrition.calories || 0} kcal</span>
                        {prod.nutrition.sodiumMg !== undefined && (
                          <>
                            <span>•</span>
                            <span>Sodium: {prod.nutrition.sodiumMg} mg</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button className="btn-pencil-sage text-xs py-1.5 px-3">
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPLOAD LABEL OCR */}
      {activeTab === 'upload' && (
        <div className="card-warm bg-white border border-beige-200 p-6 space-y-6">
          <div>
            <h3 className="text-base font-serif font-bold text-coffee-950">
              Upload Food Label Photo
            </h3>
            <p className="text-xs text-coffee-600">
              Take a clear picture of the Nutrition Facts table and ingredients list on the packaging.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-beige-300 hover:border-coffee-500 rounded-3xl p-8 text-center cursor-pointer bg-beige-50 transition-colors space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FDE8E0] border border-[#F7B29B] text-[#8D3418] flex items-center justify-center mx-auto">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm text-coffee-900 block font-semibold">
                  Tap to upload or drop food label photo
                </strong>
                <span className="text-[11px] text-coffee-500">Supports JPEG, PNG, WEBP up to 8MB</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden max-h-72 border border-beige-300 bg-black flex justify-center">
                <img
                  src={previewUrl}
                  alt="Label Preview"
                  className="max-h-72 object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-pencil-peach text-xs py-2 px-4"
                >
                  Choose Different Photo
                </button>

                <button
                  onClick={handleAnalyzePhoto}
                  disabled={isProcessingOcr}
                  className="btn-pencil-brown text-xs py-2.5 px-6 font-bold disabled:opacity-50"
                >
                  {isProcessingOcr ? processingStep : 'Run OCR Recognition & Review'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MANUAL ENTRY */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="card-warm bg-white border border-beige-200 p-6 space-y-4">
          <div>
            <h3 className="text-base font-serif font-bold text-coffee-950">
              Manual Food Label Entry
            </h3>
            <p className="text-xs text-coffee-500">
              Directly type numbers and ingredients from packaging for instant personalized analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-coffee-800 block mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Masala Oats"
                className="w-full px-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-800 block mb-1">Brand Name</label>
              <input
                type="text"
                value={manualBrand}
                onChange={(e) => setManualBrand(e.target.value)}
                placeholder="e.g. Saffola"
                className="w-full px-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-coffee-800 block mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                placeholder="150"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-coffee-800 block mb-1">Sodium (mg)</label>
              <input
                type="number"
                value={manualSodium}
                onChange={(e) => setManualSodium(e.target.value)}
                placeholder="240"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-coffee-800 block mb-1">Total Sugars (g)</label>
              <input
                type="number"
                step="0.1"
                value={manualSugars}
                onChange={(e) => setManualSugars(e.target.value)}
                placeholder="4"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-coffee-800 block mb-1">Added Sugars (g)</label>
              <input
                type="number"
                step="0.1"
                value={manualAddedSugars}
                onChange={(e) => setManualAddedSugars(e.target.value)}
                placeholder="2"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-coffee-800 block mb-1">
              Ingredient List (Separated by commas)
            </label>
            <textarea
              rows={3}
              value={manualIngredients}
              onChange={(e) => setManualIngredients(e.target.value)}
              placeholder="Rolled oats, dehydrated vegetables (carrot, onion), palm oil, iodized salt, spices..."
              className="w-full px-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700"
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-pencil-brown text-xs py-2.5 px-6 font-bold">
              Review and Analyze
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function FoodScannerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-coffee-500">Loading food scanner...</div>}>
      <FoodScannerContent />
    </Suspense>
  );
}
