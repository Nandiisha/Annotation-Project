import React, { useEffect, useState, useRef } from "react";


import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Text,
  Line,  
  Image as KonvaImage
} from "react-konva";

  

function Canvas({ token, goDashboard }) {
  // rectangles
  
const [rects, setRects] = useState([]);
const [selectedId, setSelectedId] = useState(null);
const [images, setImages] = useState([]);
const [currentImageId, setCurrentImageId] = useState(null);
const getCategoryColor = (cat) => {
  if (cat === "Vehicle") return "#ff9800";   // orange
  if (cat === "Person") return "#4caf50";    // green
  if (cat === "Object") return "#2196f3";    // blue
  return "#555"; // default
};


const [scale] = useState(1);
const [position, setPosition] = useState({ x: 0, y: 0 });
const [drawing, setDrawing] = useState(false);
const [drawMode, setDrawMode] = useState(false);
const [imageObj, setImageObj] = useState(null);

const [sidebarOpen, setSidebarOpen] = useState(false);
const lastSavedRectRef = useRef(null);

const [stageSize, setStageSize] = useState({
  width: window.innerWidth - 60,
  height: window.innerHeight - 140
});
const exportJSON = () => {

  if (!currentImageId) {
    alert("Select image first");
    return;
  }

  
  const savedAnnotations = rects.filter(r => !isNaN(Number(r.id)));

  if (savedAnnotations.length === 0) {
    alert("No saved annotations to export");
    return;
  }

  const currentImage = images.find(img => img.id === currentImageId);

  const exportData = {
    image_id: currentImageId,
    image_name: currentImage?.image_name || "unknown",
    annotations: savedAnnotations.map(r => ({
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      category: r.category,
      severity: r.severity,
      findings: r.findings,
      class_name: r.class_name,
      unique_id: r.unique_id
    }))
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create file
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentImage?.image_name || "annotations"}.json`;
  link.click();

  URL.revokeObjectURL(url);
};
const prevStageWidth = useRef(stageSize.width);
useEffect(() => {
  if (!token) return;
  fetch("https://annotation-project.onrender.com/images", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("IMAGES:", data);
      setImages(data);
    });
}, [token]);
  
 
  


  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState(50);
  const [findings, setFindings] = useState("");
  const [className, setClassName] = useState("");
  const [uniqueId, setUniqueId] = useState("");

  const stageRef = useRef();
  const trRef = useRef();
  const startPos = useRef();
  

  const selectedRect = Array.isArray(rects)
  ? rects.find(r => r.id === selectedId)
  : null;
  useEffect(() => {
    if (!selectedRect) return;
  
    lastSavedRectRef.current = { ...selectedRect };
  
    setCategory(selectedRect.category || "");
    setSeverity(selectedRect.severity || 50);
    setFindings(selectedRect.findings || "");
    setClassName(selectedRect.class_name || "");
    setUniqueId(selectedRect.unique_id || "");
  }, [selectedRect]);
  useEffect(() => {
    const handler = (e) => {
      const hasUnsavedRects = rects.some(r => isNaN(Number(r.id)));
  
      if (!hasUnsavedRects) return;
  
      e.preventDefault();
      e.returnValue = "";
    };
  
    window.addEventListener("beforeunload", handler);
  
    return () => window.removeEventListener("beforeunload", handler);
  }, [rects]);
  React.useEffect(() => {
    const sidebarWidth = sidebarOpen ? 320 : 0;
  
    const newWidth = window.innerWidth - sidebarWidth - 60;
    const newHeight = window.innerHeight - 140;
  
    const scale = newWidth / prevStageWidth.current;
  
    setRects(prev => {
      if (!Array.isArray(prev)) return [];
  
      return prev.map(r => ({
        ...r,
        x: r.x * scale,
        y: r.y * scale,
        width: r.width * scale,
        height: r.height * scale
      }));
    });
  
    prevStageWidth.current = newWidth;
  
    setStageSize({
      width: newWidth,
      height: newHeight
    });
  
  }, [sidebarOpen]);
  
  
  const deleteCurrentImage = async () => {
    const hasUnsavedRects = rects.some(r => isNaN(Number(r.id)));

if (hasUnsavedRects) {
  const confirmLeave = window.confirm(
    "Unsaved annotations will be lost. Continue delete?"
  );
  if (!confirmLeave) return;
}
    if (!currentImageId) {
      alert("No image selected");
      return;
    }
  
    const confirmDelete = window.confirm(
      "Delete this image and all its annotations?"
    );
  
    if (!confirmDelete) return;
  
    try {
      await fetch("https://annotation-project.onrender.com/images", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
  
     
      setImages(prev => prev.filter(img => img.id !== currentImageId));
      setRects([]);
      setImageObj(null);
      setCurrentImageId(null);
  
      alert("Image deleted");
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };
  
  const loadImageFromHistory = async (img) => {

    const hasUnsavedRects = rects.some(r => isNaN(Number(r.id)));
  
    if (hasUnsavedRects) {
      const confirmLeave = window.confirm(
        "You have unsaved annotations. Continue?"
      );
  
      if (!confirmLeave) return;
    }
  
    setCurrentImageId(img.id);
  
    const image = new window.Image();
    image.src = img.image_data;
    image.onload = () => setImageObj(image);
  
    const res = await fetch(
      `/api/annotations/${img.id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  
    const data = await res.json();
  
    const formatted = data.map(a => ({
      ...a,
      id: a.id.toString()
    }));
  
    setRects(formatted);
    setSelectedId(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onloadend = async () => {
      const base64 = reader.result;
  
      // 🔹 SHOW IMAGE IMMEDIATELY ON CANVAS
      const img = new window.Image();
      img.src = base64;
      img.onload = () => {
        console.log("IMAGE LOADED TO CANVAS");
        setImageObj(img);
      };
  
     
      const res = await fetch("https://annotation-project.onrender.com/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
  
      const data = await res.json();
  
      console.log("IMAGE SAVED:", data);
  
      setCurrentImageId(data.id);
      setImages(prev => [data, ...prev]);
      setRects([]); // clear old boxes
    };
  
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    // if (!imageObj || !drawMode || !currentImageId) {
    //   alert("Upload and select image first");
    //   return;
    // }

    if (e.target.className === "Rect") return;


    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    const pos = {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale
    };

   

    startPos.current = pos;
    setDrawing(true);

    const newRect = {
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      id: Date.now().toString(),
    };

    setRects(prev => [...prev, newRect]);
    setSelectedId(null);
  };

  const handleMouseMove = () => {
    if (!drawing) return;

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
const pos = {
  x: (pointer.x - position.x) / scale,
  y: (pointer.y - position.y) / scale
};

    setRects(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];

      updated[updated.length - 1] = {
        ...last,
        width: pos.x - startPos.current.x,
        height: pos.y - startPos.current.y,
      };

      return updated;
    });
  };

  const handleMouseUp = () => {
    if (drawing) {
      setDrawing(false);
      setDrawMode(false);   
  
      const lastRect = rects[rects.length - 1];
      if (lastRect) {
        setSelectedId(lastRect.id);
      }
    }
  };
  
  // const handleWheel = () => {};

  const deleteSelected = async () => {
  if (!selectedId) {
    alert("Select annotation first");
    return;
  }

  try {
    await fetch(`/api/annotations/${selectedId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // remove from UI
    setRects(prev => prev.filter(r => r.id !== selectedId));
    setSelectedId(null);

    alert("Deleted successfully");
  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
};
  React.useEffect(() => {
    const stage = stageRef.current;
    const transformer = trRef.current;
  
    if (!stage || !transformer) return;
  
    // attach transformer to RECT directly
    const selectedNode = stage.findOne(`#${selectedId}`);
  
    if (selectedNode) {
      transformer.nodes([selectedNode]);
    } else {
      transformer.nodes([]);
    }
  
    transformer.getLayer().batchDraw();
  }, [selectedId]);
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      height: "100vh",
      background: "#111",
      color: "white"
    }}>
    

<div
  style={{
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: 1100,
    height: 70,
    backdropFilter: "blur(14px)",
    background: "rgba(20,20,20,0.7)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    zIndex: 999,
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)"
  }}
>

  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>


    <label
      style={{
        padding: "10px 18px",
        borderRadius: 999,
        background: "linear-gradient(135deg,#00eaff,#00bcd4)",
        color: "#000",
        fontWeight: 600,
        cursor: "pointer",
        fontSize: 14
      }}
    >
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
    </label>


    <button
      onClick={() => setDrawMode(prev => !prev)}
      style={{
        padding: "10px 18px",
        borderRadius: 999,
        background: drawMode
          ? "linear-gradient(135deg,#7b5cff,#4f46e5)"
          : "transparent",
        border: "1px solid rgba(255,255,255,0.2)",
        color: drawMode ? "#fff" : "#ddd",
        fontWeight: 600,
        cursor: "pointer",
        fontSize: 14,
        transition: "0.2s"
      }}
    >
      {drawMode ? "Drawing ON" : "Add Annotation"}
    </button>
   

  </div>


  <button
    onClick={() => {
      localStorage.removeItem("token");
      window.location.reload();
    }}
    style={{
      padding: "10px 20px",
      borderRadius: 999,
      background: "linear-gradient(135deg,#ff4d4d,#ff1a1a)",
      border: "none",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: 14
    }}
  >
    Logout
  </button>
</div>
    

      <div style={{ display: "flex", flex: 1, marginTop: 100 }}>
        
 

      
    
      <div style={{ 
  flex: 1, 
  padding: 20, 
  transition: "all 0.3s ease"
}}>


        



<Stage
  width={stageSize.width}
  height={stageSize.height}
  ref={stageRef}
  
  draggable={false}
  onDragEnd={(e) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y()
    });
    
  }}
 
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
>
 
  <Layer>
    {imageObj && (
      <KonvaImage
      image={imageObj}
      width={stageSize.width}
      height={stageSize.height}
      listening={false}
    />
    )}
  </Layer>


  <Layer listening={false}>
    {selectedRect && (
      <>
        <Rect
          x={0}
          y={0}
          width={stageSize.width}
          height={stageSize.height}          
          fill="rgba(0,0,0,0.6)"
        />
        <Rect
          x={selectedRect.x}
          y={selectedRect.y}
          width={selectedRect.width}
          height={selectedRect.height}
          fill="black"
          globalCompositeOperation="destination-out"
        />
      </>
    )}
  </Layer>


  <Layer>
  {imageObj && Array.isArray(rects) && rects.map((rect, index) => (
    <React.Fragment key={rect.id}>
      
      {/* MAIN RECT */}
      <Rect
        id={rect.id}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        stroke="#00eaff"
        strokeWidth={2}
        draggable
        onClick={() => setSelectedId(rect.id)}
        onTap={() => setSelectedId(rect.id)}

        onDragEnd={(e) => {
          const node = e.target;
          setRects(prev =>
            prev.map(r =>
              r.id === rect.id
                ? { ...r, x: node.x(), y: node.y() }
                : r
            )
          );
        }}

        onTransformEnd={(e) => {
          const node = e.target;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          const newWidth = Math.max(5, node.width() * scaleX);
          const newHeight = Math.max(5, node.height() * scaleY);

          node.scaleX(1);
          node.scaleY(1);

          setRects(prev =>
            prev.map(r =>
              r.id === rect.id
                ? {
                    ...r,
                    x: node.x(),
                    y: node.y(),
                    width: newWidth,
                    height: newHeight
                  }
                : r
            )
          );
        }}
      />

 
{rect.category && (
  <>
    
    <Rect
      x={rect.x + 4}
      y={rect.y + 4}
      width={rect.category.length * 9 + 20}
      height={22}
      fill={getCategoryColor(rect.category)}
      cornerRadius={4}
      opacity={0.9}
    />

   
    <Text
      x={rect.x + 10}
      y={rect.y + 7}
      text={rect.category}
      fontSize={13}
      fontStyle="bold"
      fill="white"
    />
  </>
)}
     
      {selectedId === rect.id && (
        <Text
          x={rect.x + rect.width + 8}
          y={rect.y + rect.height + 8}
          text={`${Math.round(rect.width)} x ${Math.round(rect.height)}`}
          fontSize={14}
          fill="yellow"
          fontStyle="bold"
        />
      )}
    </React.Fragment>
  ))}

{selectedRect && (
  <>
    
    <Line
      points={[
        selectedRect.x,
        0,
        selectedRect.x,
        stageSize.height
      ]}
      stroke="red"
      strokeWidth={1}
      dash={[6, 4]}
    />

 
    <Line
      points={[
        0,
        selectedRect.y,
        stageSize.width,
        selectedRect.y
      ]}
      stroke="red"
      strokeWidth={1}
      dash={[6, 4]}
    />

    <Text
      x={selectedRect.x + 5}
      y={5}
      text={`X: ${Math.round(selectedRect.x)}`}
      fill="red"
      fontSize={14}
      fontStyle="bold"
    />

   
    <Text
      x={5}
      y={selectedRect.y + 5}
      text={`Y: ${Math.round(selectedRect.y)}`}
      fill="red"
      fontSize={14}
      fontStyle="bold"
    />
  </>
)}
  <Transformer
    ref={trRef}
    rotateEnabled={false}
    anchorSize={8}
    enabledAnchors={[
      "top-left",
      "top-center",
      "top-right",
      "middle-left",
      "middle-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ]}
    boundBoxFunc={(oldBox, newBox) => {
      if (newBox.width < 5 || newBox.height < 5) {
        return oldBox;
      }
      return newBox;
    }}
  />
</Layer>


</Stage>

      </div>

    
<div style={{ position: "relative", display: "flex" }}>


<button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  style={{
    position: "absolute",
    left: -30,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    background: "#00eaff",
    border: "none",
    padding: "8px 10px",
    cursor: "pointer",
    borderRadius: "4px 0 0 4px",
    fontWeight: "bold"
  }}
>
  {sidebarOpen ? ">" : "<"}
</button>


<div
  style={{
    width: sidebarOpen ? 320 : 0,
    overflow: "hidden",
    background: "#1b1b1b",
    borderLeft: sidebarOpen ? "1px solid #333" : "none",
    padding: sidebarOpen ? 20 : 0,
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    height: "100%"
  }}
>



        <h3>Annotation</h3>

        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Category</option>
          <option>Vehicle</option>
          <option>Person</option>
          <option>Object</option>
        </select>

        <label>Severity Level</label>
        <input
          type="range"
          min="0"
          max="100"
          value={severity}
          onChange={e => setSeverity(e.target.value)}
        />

        <label>Findings</label>
        <textarea
          value={findings}
          onChange={e => setFindings(e.target.value)}
          style={{ height: 100 }}
        />

        <label>ClassName</label>
        <input
          value={className}
          onChange={e => setClassName(e.target.value)}
          placeholder="Annotation name"
        />

        <label>Unique ID</label>
        <input
          value={uniqueId}
          onChange={e => setUniqueId(e.target.value)}
          placeholder="Unique ID"
        />

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: 8,
    width: "100%"
  }}
>


  


  <div style={{ display: "flex", gap: 10, width: "100%" }}>
    <button
      onClick={ () => {
        if (!currentImageId) {
          alert("Select image first");
          return;
        }
    
        if (!selectedRect) {
          alert("Select rectangle");
          return;
        }

        const isExisting = selectedRect.image_id !== undefined;
    
        const url = isExisting
          ? `/api/annotations/${selectedRect.id}`
          : "/api/annotations";
    
        const method = isExisting ? "PUT" : "POST";
    
        fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            imageId: currentImageId,
            x: selectedRect.x,
            y: selectedRect.y,
            width: selectedRect.width,
            height: selectedRect.height,
            category,
            severity,
            findings,
            className,
            uniqueId
          })
        })
          .then(async res => {
            const text = await res.text();
            if (!res.ok) throw new Error(text);
            return JSON.parse(text);
          })
          .then(data => {
            setRects(prev =>
              prev.map(r =>
                r.id === selectedRect.id
                  ? { ...data, id: data.id.toString() }
                  : r
              )
            );
    
            alert(isExisting ? "Updated!" : "Saved!");
          })
          .catch(err => {
            console.log("UPDATE ERROR FRONT:", err);
            alert("Save failed");
          });
      }}
      style={{
        flex: 1,
        padding: "12px",
        background: "#00eaff",
        color: "#000",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 700,
        textAlign: "left"
      }}
    >
      💾 Save Annotation
    </button>

    <button
      onClick={ () => {
        if (!selectedRect) return;

    const isNew = isNaN(selectedRect.id);

    if (isNew) {
      setRects(prev => prev.filter(r => r.id !== selectedRect.id));
      setSelectedId(null);
      return;
    }


    setRects(prev =>
      prev.map(r =>
        r.id === selectedRect.id
          ? { ...lastSavedRectRef.current }
          : r
      )
    );

    alert("Reverted changes");

      }}
      style={{
        flex: 1,
        padding: "12px",
        background: "#555",
        color: "white",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 500,
        textAlign: "left"
      }}
    >
      ↩ Cancel
    </button>
  </div>


  <div style={{ display: "flex", gap: 10, width: "100%" }}>
    <button
      onClick={deleteSelected}
      style={{
        flex: 1,
        padding: "12px",
        background: "#d32f2f",
        color: "white",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
        textAlign: "center"
      }}
    >
      🗑 Delete Annotation
    </button>

    <button
      onClick={deleteCurrentImage}
      style={{
        flex: 1,
        padding: "12px",
        background: "#8b0000",
        color: "white",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
        textAlign: "center"
      }}
    >
      🗑 Delete Image
    </button>
    <button
      onClick={exportJSON}
      style={{
        display:"block",
        flex: 1,
        padding: "12px",
        background: "#2e7d32",
        color: "white",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
        textAlign: "center"
      }}
    >
      📥 Export JSON
          </button>
  </div>

</div>
       
<hr style={{ borderColor: "#333"}} />
<h4 style={{ marginTop: 20 }}>Image History</h4>

{images.map(img => (
  <div
    key={img.id}
    onClick={() => loadImageFromHistory(img)}
    style={{
      padding: 8,
      cursor: "pointer",
      background: currentImageId === img.id ? "#00eaff22" : "#222",
      borderRadius: 6,
      marginBottom: 6
    }}
  >
    {img.image_name}
  </div>
))}
<div style={{ 
  display: "flex", 
  flexDirection: "column", 
  gap: 8,
  maxHeight: 250,
  overflowY: "auto"
}}>
  {rects.length === 0 && (
    <div style={{ color: "#777", fontSize: 14 }}>
      No annotations yet
    </div>
  )}

{Array.isArray(rects) && rects.map((rect, index) => {
    const isSelected = rect.id === selectedId;

    return (
      <div
        key={rect.id}
        onClick={() => setSelectedId(rect.id)}
        style={{
          padding: 10,
          borderRadius: 6,
          cursor: "pointer",
          background: isSelected ? "#00eaff22" : "#222",
          border: isSelected ? "1px solid #00eaff" : "1px solid #333"
        }}
      >
        <strong>Annotation {index + 1}</strong>

        {isSelected && (
          <div style={{ 
            marginTop: 6, 
            fontSize: 13, 
            color: "#ccc",
            lineHeight: 1.6
          }}>
            <div>X: {Math.round(rect.x)}</div>
            <div>Y: {Math.round(rect.y)}</div>
            <div>Width: {Math.round(rect.width)}</div>
            <div>Height: {Math.round(rect.height)}</div>
          </div>
        )}
      </div>
    );
  })}
</div>
      </div>
    </div>
  </div>
  </div>

  )

  
}

export default Canvas;
