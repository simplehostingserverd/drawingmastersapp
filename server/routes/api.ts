import express from 'express';

const router = express.Router();

// Get active rooms
router.get('/rooms', (req, res) => {
  // This would typically query a database
  res.json({
    rooms: [
      { id: 'room-1', name: 'Public Drawing Room', userCount: 5 },
      { id: 'room-2', name: 'Art Class 101', userCount: 12 },
      { id: 'room-3', name: 'Sketch Club', userCount: 3 }
    ]
  });
});

// Create a new room
router.post('/rooms', (req, res) => {
  const { name, isPrivate } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }
  
  // This would typically create a room in a database
  const roomId = `room-${Date.now()}`;
  
  res.status(201).json({
    id: roomId,
    name,
    isPrivate: isPrivate || false,
    created: new Date().toISOString()
  });
});

// Save drawing
router.post('/drawings', (req, res) => {
  const { name, imageData, metadata } = req.body;
  
  if (!name || !imageData) {
    return res.status(400).json({ error: 'Name and image data are required' });
  }
  
  // This would typically save to a database or storage
  const drawingId = `drawing-${Date.now()}`;
  
  res.status(201).json({
    id: drawingId,
    name,
    created: new Date().toISOString(),
    url: `/api/drawings/${drawingId}`
  });
});

// Get drawing by ID
router.get('/drawings/:id', (req, res) => {
  const { id } = req.params;
  
  // This would typically fetch from a database or storage
  if (!id.startsWith('drawing-')) {
    return res.status(404).json({ error: 'Drawing not found' });
  }
  
  res.json({
    id,
    name: 'Sample Drawing',
    created: new Date().toISOString(),
    url: `/api/drawings/${id}`,
    imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  });
});

// Get user drawings
router.get('/users/:userId/drawings', (req, res) => {
  const { userId } = req.params;
  
  // This would typically fetch from a database
  res.json({
    drawings: [
      { id: 'drawing-1', name: 'Landscape', created: new Date().toISOString() },
      { id: 'drawing-2', name: 'Portrait', created: new Date().toISOString() },
      { id: 'drawing-3', name: 'Abstract', created: new Date().toISOString() }
    ]
  });
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;