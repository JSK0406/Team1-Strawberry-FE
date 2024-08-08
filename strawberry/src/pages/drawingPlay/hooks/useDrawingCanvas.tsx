import { useState, useRef, useEffect } from "react";
import rough from "roughjs/bundled/rough.esm";

import { useDrawingPlayDispatch } from "./useDrawingPlayDispatch";
import { useDrawingPlayState } from "../hooks/useDrawingPlayState";

import santafeLineBG from "/src/assets/images/background/santafeLineBG.svg";
import interiorLineBG from "/src/assets/images/background/interiorLineBG.svg";
import exteriorLineBG from "/src/assets/images/background/exteriorLineBG.svg";

type Point = { x: number; y: number };
type LineStyle = {
  stroke: string;
  lineWidth: number;
  lineStyle: string;
  roughness: number;
  bowing: number;
  strokeWidth: number;
};

const customLineStyle: LineStyle = {
  stroke: "#46474C",
  lineWidth: 2,
  lineStyle: "round",
  roughness: 0.5,
  bowing: 1,
  strokeWidth: 5,
};

export function useDrawingCanvas(timeLimit = 10) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState<Point[]>([]);
  const userPointsRef = useRef<Point[]>([]);
  const [timer, setTimer] = useState(timeLimit);
  const imgPaths = ["", santafeLineBG, interiorLineBG, exteriorLineBG];
  let id;

  const { stage } = useDrawingPlayState();
  const dispatch = useDrawingPlayDispatch();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 938;
      canvas.height = 513;
    }
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setIsDrawing(false);
    }
  }, [timer]);

  useEffect(() => {
    if (userPoints.length > 0) {
      console.log(userPoints);
    }
    userPointsRef.current = userPoints; // 최신의 userPoints를 ref에 저장
  }, [userPoints]);

  const setPlayTimeout = () => {
    dispatch({ type: "SET_START_DRAWING" });
    id = setTimeout(() => {
      dispatch({ type: "SET_FINISH_DRAWING" });
      dispatch({ type: "SET_RESULT" });
      const canvasImage = canvasRef.current?.toDataURL("image/png"); // 캔버스를 이미지로 변환
      dispatch({
        type: "SET_CANVAS_IMG",
        payload: canvasImage || "",
      });
    }, 7000);
    return () => {
      clearTimeout(id);
    }; // 필요할 때 타이머를 취소하도록 함수 반환
  };

  const startDrawing = () => {
    console.log("down");
    setPlayTimeout();
    setUserPoints([]);
    userPointsRef.current = []; // ref도 초기화
    setTimer(timeLimit);
    setIsDrawing(true); // 버튼 클릭 시 드로잉 상태를 활성화

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopDrawing = () => {
    setTimeout(() => {
      dispatch({ type: "SET_FINISH_DRAWING" });
      dispatch({ type: "SET_RESULT" });
      const canvasImage = canvasRef.current?.toDataURL("image/png"); // 캔버스를 이미지로 변환
      dispatch({
        type: "SET_CANVAS_IMG",
        payload: canvasImage || "",
      });
      clearTimeout(id);
    }, 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("down");
    if (isDrawing) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setUserPoints([{ x, y }]);
      }
    }
  };

  const handleClick = () => {
    console.log("click");
    setTimeout(() => {
      if (isDrawing) {
        stopDrawing();
      }
    }, 100);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    console.log("up");
    if (isDrawing) {
      stopDrawing();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setUserPoints((prevPoints) => [...prevPoints, { x, y }]);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const rc = rough.canvas(canvas!);

      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (userPoints.length > 1) {
        rc.line(
          userPoints[0].x,
          userPoints[0].y,
          userPoints[1].x,
          userPoints[1].y,
          customLineStyle,
        );
        for (let i = 1; i < userPoints.length - 1; i++) {
          rc.line(
            userPoints[i].x,
            userPoints[i].y,
            userPoints[i + 1].x,
            userPoints[i + 1].y,
            customLineStyle,
          );
        }
      }
    }
  };

  return {
    canvasRef,
    isDrawing,
    imgPath: imgPaths[stage],
    startDrawing,
    handleClick,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
  };
}
