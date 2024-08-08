import styled from "styled-components";

import { useDrawingPlayState } from "../../hooks/useDrawingPlayState";

const ImageResult: React.FC = () => {
  const { canvasImg } = useDrawingPlayState(); // 컨텍스트에서 이미지 데이터를 가져옴

  return <StyledCanvasImage src={canvasImg} alt="Drawing Result" />;
};

export default ImageResult;

const StyledCanvasImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 938px;
  height: 513px;
  z-index: 10;
`;
