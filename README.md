# Excel-to-PDF Builder

A web app for converting Excel sheets into PDF with custom page breaks and previews.  
- **Backend:** FastAPI (Python)  
- **Frontend:** Next.js + TypeScript  
- Features: Drag-and-drop Excel upload, image previews, and PDF export.

## Quick Start

### Backend (FastAPI)
```
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Next.js)
```
cd frontend
npm install
npm run dev
```

- Backend runs at: `http://127.0.0.1:8000`  
- Frontend runs at: `http://localhost:3000`
