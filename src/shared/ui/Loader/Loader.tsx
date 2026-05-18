"use client";
import { LoaderContainer, Loading, Overlay } from "./styled";

const Loader = () => {
  return (
    <>
      <Overlay />
      <LoaderContainer>
        <Loading />
      </LoaderContainer>
    </>
  );
};

export default Loader;
