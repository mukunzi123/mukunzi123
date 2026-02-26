import express from "express";
import { createServer as createViteServer } from "vite";
import { Comment, Movie, User } from "./types";
import fs from "fs";
import path from "path";
import multer from "multer";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

// Database structure
interface Database {
  movies: Movie[];
  comments: Comment[];
  users: User[];
  videoViews: Record<string, number>;
  commentIdCounter: number;
}

// Initial data if DB doesn't exist
const INITIAL_DB: Database = {
  movies: [
    {
      id: 's-1',
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
      trailerUrl: 'https://www.youtube-nocookie.com/embed/zSWdZVtXT7E',
      videoUrl: 'https://www.youtube-nocookie.com/embed/zSWdZVtXT7E',
      category: 'Sci-Fi',
      year: 2014,
      releaseDate: '2014-11-07',
      director: 'Christopher Nolan',
      country: 'USA / UK',
      fileSize: '2.4 GB',
      popularity: 98,
      quality: '4K',
      status: 'Online'
    },
    {
      id: 's-2',
      title: 'The Matrix',
      description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1000',
      trailerUrl: 'https://www.youtube-nocookie.com/embed/vKQi3bBA1y8',
      videoUrl: 'https://www.youtube-nocookie.com/embed/vKQi3bBA1y8',
      category: 'Sci-Fi',
      year: 1999,
      releaseDate: '1999-03-31',
      director: 'Lana & Lilly Wachowski',
      country: 'USA',
      fileSize: '1.8 GB',
      popularity: 95,
      quality: 'Full HD',
      status: 'Online'
    },
    {
      id: 'a-1',
      title: 'John Wick',
      description: 'An ex-hit-man comes out of retirement to track down the gangsters that killed his dog and took everything from him.',
      posterUrl: 'https://images.unsplash.com/photo-1611419010196-a360856ff42f?auto=format&fit=crop&q=80&w=1000',
      trailerUrl: 'https://www.youtube-nocookie.com/embed/2AUmvWm5P2I',
      videoUrl: 'https://www.youtube-nocookie.com/embed/2AUmvWm5P2I',
      category: 'Action',
      year: 2014,
      releaseDate: '2014-10-24',
      fileSize: '1.6 GB',
      popularity: 96,
      quality: 'Full HD',
      status: 'Online'
    },
    {
      id: 'h-1',
      title: 'The Conjuring',
      description: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.',
      posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1000',
      trailerUrl: 'https://www.youtube-nocookie.com/embed/k10ETZ41q5o',
      videoUrl: 'https://www.youtube-nocookie.com/embed/k10ETZ41q5o',
      category: 'Horror',
      year: 2013,
      releaseDate: '2013-07-19',
      fileSize: '1.4 GB',
      popularity: 92,
      quality: 'Full HD',
      status: 'Online'
    }
  ],
  comments: [],
  users: [
    {
      id: 'admin-1',
      name: 'Mukunzi Fabien',
      email: 'mukunzifabien@gmail.com',
      role: 'admin',
      downloads: [],
      createdAt: Date.now()
    }
  ],
  videoViews: {},
  commentIdCounter: 1
};

// Load database from file
function loadDb(): Database {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading database:", error);
  }
  return { ...INITIAL_DB };
}

// Save database to file
function saveDb(db: Database) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

let db = loadDb();

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- MOVIE API ---

app.get("/api/movies", (req, res) => {
  res.json(db.movies);
});

app.get("/api/movies/:id", (req, res) => {
  const movie = db.movies.find(m => m.id === req.params.id);
  if (movie) res.json(movie);
  else res.status(404).json({ error: "Movie not found" });
});

app.post("/api/admin/movies", (req, res) => {
  const movie: Movie = req.body;
  db.movies.push(movie);
  saveDb(db);
  res.status(201).json(movie);
});

app.put("/api/admin/movies/:id", (req, res) => {
  const index = db.movies.findIndex(m => m.id === req.params.id);
  if (index !== -1) {
    db.movies[index] = { ...db.movies[index], ...req.body };
    saveDb(db);
    res.json(db.movies[index]);
  } else {
    res.status(404).json({ error: "Movie not found" });
  }
});

app.delete("/api/admin/movies/:id", (req, res) => {
  db.movies = db.movies.filter(m => m.id !== req.params.id);
  saveDb(db);
  res.json({ message: "Movie deleted" });
});

app.post("/api/admin/movies/bulk-status", (req, res) => {
  const { ids, status } = req.body;
  db.movies = db.movies.map(m => ids.includes(m.id) ? { ...m, status } : m);
  saveDb(db);
  res.json({ message: "Bulk status updated" });
});

// --- AUTH API ---

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    role: email.toLowerCase() === 'mukunzifabien@gmail.com' ? 'admin' : 'user',
    downloads: [],
    createdAt: Date.now()
  };
  db.users.push(newUser);
  saveDb(db);
  res.status(201).json(newUser);
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/admin/users", (req, res) => {
  res.json(db.users);
});

app.delete("/api/admin/users/:id", (req, res) => {
  db.users = db.users.filter(u => u.id !== req.params.id);
  saveDb(db);
  res.json({ message: "User deleted" });
});

app.post("/api/users/:id/download", (req, res) => {
  const { id } = req.params;
  const { movieId } = req.body;
  const user = db.users.find(u => u.id === id);
  if (user && !user.downloads.includes(movieId)) {
    user.downloads.push(movieId);
    saveDb(db);
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post("/api/admin/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// --- COMMENT API ---

app.post("/api/comments", (req, res) => {
  try {
    const { video_id, username, email, comment_text } = req.body;

    if (!comment_text || comment_text.trim() === "") {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }
    if (!video_id || !username) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newComment: Comment = {
      id: db.commentIdCounter++,
      video_id,
      username,
      email,
      comment_text,
      created_at: Date.now(),
      status: 'Pending',
    };

    db.comments.push(newComment);
    saveDb(db);

    res.status(201).json({ 
      message: "Comment saved successfully", 
      comment: newComment 
    });
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/comments", (req, res) => {
  res.json(db.comments);
});

app.patch("/api/admin/comments/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const comment = db.comments.find(c => c.id === parseInt(id));
  if (comment) {
    comment.status = status;
    saveDb(db);
    res.json({ message: `Comment status updated to ${status}`, comment });
  } else {
    res.status(404).json({ error: "Comment not found" });
  }
});

app.delete("/api/admin/comments/:id", (req, res) => {
  const { id } = req.params;
  db.comments = db.comments.filter(c => c.id !== parseInt(id));
  saveDb(db);
  res.json({ message: "Comment deleted successfully" });
});

// --- STATS & VIEWS ---

app.get("/api/admin/stats", (req, res) => {
  res.json({
    totalMovies: db.movies.length,
    totalUsers: db.users.length,
    totalComments: db.comments.length,
    pendingComments: db.comments.filter(c => c.status === 'Pending').length,
    totalViews: Object.values(db.videoViews).reduce((a, b) => a + b, 0),
  });
});

app.post("/api/videos/:id/view", (req, res) => {
  const video_id = req.params.id;
  if (!db.videoViews[video_id]) {
    db.videoViews[video_id] = 0;
  }
  db.videoViews[video_id] += 1;
  saveDb(db);
  res.json({ views: db.videoViews[video_id] });
});

app.get("/api/videos/:id/comments", (req, res) => {
  const video_id = req.params.id;
  const filteredComments = db.comments.filter(c => c.video_id === video_id && c.status === 'Approved');
  res.json(filteredComments);
});

app.get("/api/videos/:id/views", (req, res) => {
  const video_id = req.params.id;
  res.json({ views: db.videoViews[video_id] || 0 });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
