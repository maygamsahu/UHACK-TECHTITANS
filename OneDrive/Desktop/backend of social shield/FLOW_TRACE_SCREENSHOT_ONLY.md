# Backend Flow Trace: Screenshot-Only Upload in Manual Mode

## Summary
When **ONLY a screenshot is uploaded** (no form data) in manual mode, the backend:
1. ✅ **Initializes account_data with hardcoded defaults**
2. ✅ **Attempts to extract data from the screenshot via OCR**
3. ✅ **Overwrites defaults with OCR-extracted data** where available
4. ✅ **Analyzes the final merged account_data** (defaults + OCR results)
5. ⚠️ **Sets analysis_type='private_ocr'** to indicate OCR-based analysis

---

## Complete Data Flow Trace

### ENTRY POINT: `/analyze-private-ocr` Endpoint
**File:** [backend/app.py](backend/app.py#L107-L149)

```python
@app.route('/analyze-private-ocr', methods=['POST'])
def analyze_private_ocr():
    try:
        # Line 109: Check if images were uploaded
        if 'images' not in request.files:
            return jsonify(ResultsFormatter.format_error("No images uploaded")), 400
        
        # Lines 113-120: Save uploaded images to temporary folder
        image_paths = []
        for file in request.files.getlist('images'):
            if file.filename == '':
                continue
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)                    # ← Screenshot saved to disk
            image_paths.append(file_path)
        
        # Line 123: Get form data if available
        form_data = request.form.to_dict() if request.form else None
        # └─ SCREENSHOT-ONLY MODE: form_data = None or {}
        
        # Line 126: ENTRY POINT TO PRIVATE HANDLER
        result = form_handler.process_image_uploads(image_paths, form_data)
        
        # Lines 129-135: Cleanup
        # Lines 138-141: Format and return results
        formatted_result = ResultsFormatter.format_private_ocr_results(result)
        return jsonify(formatted_result)
```

**Key Variables At Entry:**
- `image_paths`: List with path to uploaded screenshot
- `form_data`: `None` (no form submitted)

---

### STEP 1: FormHandler Delegation
**File:** [backend/private_flow/form_handler.py](backend/private_flow/form_handler.py#L14-L16)

```python
def process_image_uploads(self, image_paths, form_data=None):
    """Process uploaded images for private account analysis"""
    # Line 16: Delegate to PrivateAccountHandler
    return self.private_handler.analyze_private_account_images(image_paths, form_data)
    #         └─ Passes: image_paths=[screenshot_path], form_data=None
```

**No processing happens here—direct delegation.**

---

### STEP 2: Initialize Account Data with Defaults
**File:** [backend/private_flow/private_handler.py](backend/private_flow/private_handler.py#L51-L73)

```python
def analyze_private_account_images(self, image_paths, form_data=None):
    """Analyze private account using uploaded images"""
    try:
        # Lines 52-73: INITIALIZE account_data with defaults
        if form_data:
            # Branch NOT taken for screenshot-only (form_data=None)
            account_data = {
                'profile pic': int(form_data.get('profile_pic', 1)),
                # ... etc
            }
        else:
            # ✅ SCREENSHOT-ONLY MODE TAKES THIS BRANCH
            # Lines 66-77: HARDCODED DEFAULT VALUES
            account_data = {
                'profile pic': 1,                      # ← Default
                'nums/length username': 0.0,           # ← Default
                'fullname words': 1,                   # ← Default
                'nums/length fullname': 0.0,           # ← Default
                'name==username': 0,                   # ← Default
                'description length': 50,              # ← Default
                'external URL': 0,                     # ← Default
                'private': 1,                          # Default to 1 for this flow
                '#posts': 50,                          # ← Default
                '#followers': 200,                     # ← Default
                '#follows': 150                        # ← Default
            }
```

**State After Step 2:**
```
account_data = {
    'profile pic': 1,
    'nums/length username': 0.0,
    'fullname words': 1,
    'nums/length fullname': 0.0,
    'name==username': 0,
    'description length': 50,
    'external URL': 0,
    'private': 1,
    '#posts': 50,
    '#followers': 200,
    '#follows': 150
}
```

---

### STEP 3: Process Each Image (OCR Extraction & Merging)
**File:** [backend/private_flow/private_handler.py](backend/private_flow/private_handler.py#L79-L90)

```python
        # Lines 79-95: Process each image
        for image_path in image_paths:
            if os.path.exists(image_path):
                # Line 82: EXTRACT TEXT DATA FROM SCREENSHOT
                ocr_data = self.image_processor.extract_text_from_image(image_path)
                #          └─ Returns Dict with extracted Instagram metrics
                
                # Lines 85-87: UPDATE account_data with OCR results
                for key, value in ocr_data.items():
                    if key in account_data:
                        # ✅ OVERWRITE DEFAULT WITH OCR VALUE
                        account_data[key] = value
                        #└─ Merges OCR data: defaults → OCR extracted values
                
                # Lines 89-91: Check for profile picture
                if 'profile' in image_path.lower():
                    pic_quality = self.image_processor.analyze_profile_picture(image_path)
                    account_data['profile pic'] = pic_quality['has_profile_pic']
```

**Key Point:** Each OCR-extracted value **overwrites** the corresponding default value.

---

### STEP 3A: Image Processor - Extract Text from Screenshot
**File:** [backend/private_flow/image_processor.py](backend/private_flow/image_processor.py#L12-L52)

```python
def extract_text_from_image(self, image_path: str) -> Dict:
    """Extract text data from image using OCR with preprocessing"""
    try:
        # Line 15: Load image from disk
        img = cv2.imread(image_path)
        if img is None:
            return self._get_default_data()  # Fallback if image unreadable
        
        # Lines 18-29: Preprocessing for better OCR
        # 1. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Rescale image (2x) for better OCR of small text
        gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        # 3. Denoising
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        
        # 4. Thresholding (Otsu's Binarization)
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Lines 32-35: Perform OCR
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(thresh, config=custom_config)
        
        # Line 38: Fallback OCR on raw image
        raw_text = pytesseract.image_to_string(img)
        
        # Line 41: Combine both OCR results
        full_text = text + "\n" + raw_text
        
        # Line 44: Parse extracted text to find Instagram metrics
        data = self._parse_text(full_text)  # ← Extract metrics
        return data
    except Exception as e:
        print(f"OCR Error: {e}")
        return self._get_default_data()  # Fallback: return defaults
```

**OCR Process:**
1. Image preprocessing (grayscale → denoise → threshold)
2. Pytesseract extracts raw text
3. Text parsing extracts Instagram metrics (Posts, Followers, Following, Username, etc.)
4. Returns extracted data or defaults if OCR fails

---

### STEP 3B: Parse Extracted Text to Find Instagram Metrics
**File:** [backend/private_flow/image_processor.py](backend/private_flow/image_processor.py#L53-L130)

```python
def _parse_text(self, text: str) -> Dict:
    """Robust parsing of extracted text to find Instagram metrics"""
    # Line 54: Start with defaults
    data = self._get_default_data()
    
    # Line 57: Normalize text
    text = text.replace(',', '')
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Lines 60-78: Extract Posts, Followers, Following numbers
    for i, line in enumerate(lines):
        # Pattern 1: "123 posts" or "456 followers"
        metric_match = re.search(r'(\d+)\s*(posts|followers|following)', line, re.IGNORECASE)
        if metric_match:
            val = int(metric_match.group(1))
            label = metric_match.group(2).lower()
            if 'posts' in label: 
                data['#posts'] = val          # ← Update #posts
            elif 'followers' in label: 
                data['#followers'] = val      # ← Update #followers
            elif 'following' in label: 
                data['#follows'] = val        # ← Update #follows
        
        # Pattern 2: "followers 456" (reversed)
        metric_match_rev = re.search(r'(posts|followers|following)\s*(\d+)', line, re.IGNORECASE)
        if metric_match_rev:
            val = int(metric_match_rev.group(2))
            label = metric_match_rev.group(1).lower()
            if 'posts' in label and data['#posts'] == 50: 
                data['#posts'] = val
            elif 'followers' in label and data['#followers'] == 200: 
                data['#followers'] = val
            elif 'following' in label and data['#follows'] == 150: 
                data['#follows'] = val
    
    # Lines 81-91: Handle vertical layout (Number on one line, Label on next)
    for i in range(len(lines) - 1):
        if lines[i].isdigit():
            val = int(lines[i])
            label = lines[i+1].lower()
            if 'posts' in label: 
                data['#posts'] = val
            elif 'followers' in label: 
                data['#followers'] = val
            elif 'following' in label: 
                data['#follows'] = val
    
    # Lines 94-128: Extract Username, Fullname, Bio, URL
    # ... (username extraction logic)
    # ... (fullname words extraction logic)
    # ... (description length extraction logic)
    # ... (external URL detection)
    
    return data  # ← Return parsed metrics
```

**Data Returned from _parse_text():**
- Could be updated values if regex patterns matched
- Could be default values if OCR failed to extract readable text

**Default Data Structure (Fallback):**
```python
def _get_default_data(self) -> Dict:
    """Return default data structure"""
    return {
        'profile pic': 1,
        'nums/length username': 0.0,
        'fullname words': 1,
        'nums/length fullname': 0.0,
        'name==username': 0,
        'description length': 50,
        'external URL': 0,
        'private': 0,              # ← Note: private=0 by default
        '#posts': 50,
        '#followers': 200,
        '#follows': 150
    }
```

---

### STEP 4: Analyze Account with AI Model
**File:** [backend/private_flow/private_handler.py](backend/private_flow/private_handler.py#L97-L107)

```python
        # Line 97: AI Analysis using FINAL account_data
        result = self.detector.explain_prediction(account_data)
        #         └─ Analyzes merged data: (defaults OR OCR-extracted values)
        
        # Lines 100-109: Format results
        formatted_result = {
            'trust_score': result['trust_score'],
            'prediction': result['prediction'],           # Fake/Real
            'confidence': result['confidence'],
            'ffr_ratio': result['ffr_ratio'],
            'risk_factors': result['indicators'],
            'explanation': result['explanation'],
            'account_data': account_data,                 # ← Include merged data
            'analysis_type': 'private_ocr'                # ← Flag: OCR-based
        }
        
        return formatted_result
```

**Key Flag:** `'analysis_type': 'private_ocr'` indicates screenshot-based analysis.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                 USER UPLOADS SCREENSHOT ONLY                    │
│                      (No form data)                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  /analyze-private-ocr Endpoint (app.py:107)                     │
│  - image_files: [screenshot.png]                                │
│  - form_data: None                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  FormHandler.process_image_uploads()                            │
│  - Delegates to PrivateAccountHandler                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  PrivateAccountHandler.analyze_private_account_images()         │
│  (private_handler.py:51)                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────────────────┐ ┌──────────────────────────────┐
│  STEP 1: Initialize       │ │  STEP 2: OCR Extract         │
│  account_data with        │ │                              │
│  HARDCODED DEFAULTS       │ │  ImageProcessor.             │
│  (because form_data=None) │ │  extract_text_from_image()   │
│                           │ │                              │
│  data = {                 │ │  - Preprocess image          │
│    'profile pic': 1,      │ │  - Run OCR (pytesseract)     │
│    '#posts': 50,          │ │  - Parse text patterns       │
│    '#followers': 200,     │ │  - Extract metrics           │
│    '#follows': 150,       │ │                              │
│    ...                    │ │  Returns: ocr_data = {       │
│  }                        │ │    '#posts': 123,            │
│                           │ │    '#followers': 5000,       │
│                           │ │    ...                       │
│                           │ │  }                           │
└────────┬──────────────────┘ └──────────┬───────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────┐
        │  STEP 3: MERGE DATA                 │
        │  For each key in ocr_data:          │
        │    account_data[key] = ocr_data[key]│
        │                                     │
        │  Result:                            │
        │  account_data = {                   │
        │    'profile pic': 1,   (default)    │
        │    '#posts': 123,      (OCR!)       │
        │    '#followers': 5000, (OCR!)       │
        │    '#follows': 150,    (default)    │
        │    ...                              │
        │  }                                  │
        └─────────────────────┬───────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  STEP 4: AI Analysis                │
        │  InstagramFakeDetector.             │
        │  explain_prediction(account_data)   │
        │                                     │
        │  Returns: {                         │
        │    'prediction': 'Fake/Real'        │
        │    'trust_score': 0-100             │
        │    'confidence': %                  │
        │    ...                              │
        │  }                                  │
        └─────────────────────┬───────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  STEP 5: Format Response            │
        │  formatted_result = {               │
        │    'account_data': account_data,    │
        │    'analysis_type': 'private_ocr',  │
        │    'prediction': ...,               │
        │    'trust_score': ...,              │
        │    ...                              │
        │  }                                  │
        └─────────────────────┬───────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Return JSON Response to Client     │
        │  (ResultsFormatter.                 │
        │   format_private_ocr_results)       │
        └─────────────────────────────────────┘
```

---

## Key Findings: Answers to Your Questions

### 1️⃣ **Is account_data initialized with defaults at start?**
**YES** ✅
- Line 66-77 in [private_handler.py](backend/private_flow/private_handler.py#L66-L77)
- When `form_data=None` (screenshot-only mode), hardcoded defaults are used
- Default values: `#posts=50, #followers=200, #follows=150, profile_pic=1, etc.`

### 2️⃣ **Then is it updated with OCR-extracted data?**
**YES** ✅
- Line 85-87 in [private_handler.py](backend/private_flow/private_handler.py#L85-L87)
- Loop: `for key, value in ocr_data.items(): if key in account_data: account_data[key] = value`
- OCR values **overwrite** default values

### 3️⃣ **Is there any duplicate processing or data repeated?**
**MINOR DUPLICATION** ⚠️
- Image processor attempts TWO OCR passes:
  - Line 34 in [image_processor.py](backend/private_flow/image_processor.py#L34): `text = pytesseract.image_to_string(thresh, config=custom_config)`
  - Line 38: `raw_text = pytesseract.image_to_string(img)`
  - Line 41: Combined: `full_text = text + "\n" + raw_text`
- Both are parsed by the same `_parse_text()` function
- This could lead to duplicate data in `full_text`, but regex patterns should handle it

### 4️⃣ **What exactly gets analyzed?**
**MERGED DATA** ✅
- The AI model receives `account_data` containing:
  - **Defaults for fields NOT found in OCR** (e.g., `profile_pic=1` if no profile picture detected)
  - **OCR-extracted values for fields FOUND in screenshot** (e.g., `#posts=123` if text "123 posts" detected)
- This is a **hybrid approach**: Use OCR where possible, fallback to defaults otherwise

### 5️⃣ **Are there any flags or markers indicating which data was used?**
**LIMITED FLAGS** ⚠️
- ✅ `'analysis_type': 'private_ocr'` — Indicates screenshot-based analysis (not manual)
- ❌ **NO per-field flags** — No indication of which specific values came from OCR vs. defaults
- ❌ **NO confidence scores** — OCR data treated as equal to manual input

---

## Potential Issues Identified

### ⚠️ Issue 1: No OCR Confidence Tracking
**Problem:** When OCR extracts a value, it's used without any confidence score or validation.
```python
account_data[key] = value  # Line 86 - direct assignment, no validation
```
**Impact:** Bad OCR results (e.g., misreading "5000" as "3000") are treated as ground truth.

### ⚠️ Issue 2: Regex Pattern Fragility
**Problem:** Text extraction relies on regex patterns that may not match all Instagram layouts.
```python
metric_match = re.search(r'(\d+)\s*(posts|followers|following)', line, re.IGNORECASE)
```
**Impact:** If Instagram layout changes or text formatted differently, defaults are used instead.

### ⚠️ Issue 3: Private Flag Inconsistency
**Problem:** Two different default values for `private`:
- [image_processor.py](backend/private_flow/image_processor.py#L146): `'private': 0`
- [private_handler.py](backend/private_flow/private_handler.py#L71): `'private': 1`

**Scenario:**
1. If OCR fails completely, `_get_default_data()` returns `private=0`
2. But `analyze_private_account_images()` initializes with `private=1`
3. If no metrics extracted from OCR, `account_data['private']` stays `1`
4. If metrics extracted but `'private'` not found in `ocr_data`, it stays `1` ✅

**Impact:** Likely OK in practice, but creates confusion.

### ⚠️ Issue 4: No Distinction Between "Default Used" vs "OCR Extracted"
**Problem:** Final `account_data` includes both defaults and OCR values without tracking origin.
```python
'account_data': account_data,  # Line 104 - mixed sources, no metadata
```
**Impact:** Client cannot determine confidence in each metric.

### ⚠️ Issue 5: Profile Picture Analysis Optional
**Problem:** Profile picture analysis only runs if filename contains "profile"
```python
if 'profile' in image_path.lower():  # Line 89
    pic_quality = self.image_processor.analyze_profile_picture(image_path)
```
**Impact:** If user uploads screenshot without "profile" in filename, `profile pic` stays at default (1).

---

## Data Flow Execution Example

### Scenario: User uploads `screenshot.png` (Instagram grid showing: "123 Posts | 5000 Followers | 1200 Following")

**Step 1: Initialize**
```python
account_data = {
    '#posts': 50,        # Default
    '#followers': 200,   # Default
    '#follows': 150,     # Default
    # ... other defaults
}
```

**Step 2: OCR Extract**
```python
ocr_data = {
    '#posts': 123,       # Extracted from "123 Posts"
    '#followers': 5000,  # Extracted from "5000 Followers"
    '#follows': 1200,    # Extracted from "1200 Following"
    # ... other extracted fields or defaults
}
```

**Step 3: Merge**
```python
for key, value in ocr_data.items():
    if key in account_data:
        account_data[key] = value  # Overwrite defaults

# Result:
account_data = {
    '#posts': 123,          # ← Overwritten by OCR
    '#followers': 5000,     # ← Overwritten by OCR
    '#follows': 1200,       # ← Overwritten by OCR
    # ... other fields unchanged (defaults or partially extracted)
}
```

**Step 4: Analyze**
```python
result = detector.explain_prediction(account_data)
# AI model receives merged data and predicts: "Fake/Real"
```

**Step 5: Return**
```json
{
  "analysis_type": "private_ocr",
  "prediction": "Real",
  "trust_score": 78,
  "account_data": {
    "#posts": 123,
    "#followers": 5000,
    "#follows": 1200,
    ...
  }
}
```

---

## Summary

| Question | Answer | Evidence |
|----------|--------|----------|
| Defaults initialized? | **YES** | [private_handler.py:66-77](backend/private_flow/private_handler.py#L66-L77) |
| Updated with OCR? | **YES** | [private_handler.py:85-87](backend/private_flow/private_handler.py#L85-L87) |
| Duplicate processing? | **YES (minor)** | [image_processor.py:34,38](backend/private_flow/image_processor.py#L34) - two OCR passes |
| What gets analyzed? | **Merged data** | [private_handler.py:97](backend/private_flow/private_handler.py#L97) - `explain_prediction(account_data)` |
| Data origin flags? | **LIMITED** | Only `analysis_type='private_ocr'`; no per-field tracking |

