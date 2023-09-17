import React, { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

// Components
import CircularButton from "./components/atoms/CircularButton";

const App = () => {
  const [localPeer, setLocalPeer] = useState(null);
  const [localPeerId, setLocalPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [modalOpen, setModalOpen] = useState(true);
  const [joinRoom, setJoinRoom] = useState(false);
  const [emptyRoom, setEmptyRoom] = useState(true);
  const [localVideoActive, setLocalVideoActive] = useState(false);
  const [localAudioActive, setLocalAudioActive] = useState(false);
  const [remoteVideoActive, setRemoteVideoActive] = useState(false);
  const [remoteAudioActive, setRemoteAudioActive] = useState(false);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  useEffect(() => {
    // Initialize a new Peer instance
    const newPeer = new Peer({
      host: import.meta.env.VITE_SERVER_HOST,
      port: import.meta.env.VITE_SERVER_PORT,
      path: import.meta.env.VITE_PEER_SERVER_PATH,
    });

    newPeer.on("open", (id) => {
      setLocalPeerId(id);
    });

    newPeer.on("connection", (dataConnection) => {
      dataConnection.on("data", (data) => {
        console.log(data);
        setEmptyRoom(false);
      });
    });

    newPeer.on("call", (mediaConnection) => {
      // Answer the call and attach the remote stream to your video element
      mediaConnection.answer(localStream);

      mediaConnection.on("stream", (remoteStream) => {
        // Handle the remote stream
        setRemoteVideoActive(true);
        remoteStreamRef.current.srcObject = remoteStream;
      });
    });

    newPeer.on("close", () => {});

    newPeer.on("disconnected", () => {});

    newPeer.on("error", (error) => {});

    setLocalPeer(newPeer);

    // Clean up the Peer instance on component unmount
    return () => {
      newPeer.destroy();
    };
  }, []);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: localAudioActive,
        video: true,
      });

      // Save the local stream to state
      setLocalStream(stream);

      // Set the local video stream as active
      setLocalVideoActive(true);

      // Set the stream to your local video element
      localStreamRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error starting video:", error);
    }
  };

  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: localVideoActive,
      });

      // Save the local stream to state
      setLocalStream(stream);

      // Set the local audio stream as active
      setLocalAudioActive(true);

      // Set the stream to your local video element
      localStreamRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error starting audio:", error);
    }
  };

  const stopVideoStream = () => {
    // Stop all videos tracks in the stream
    localStream.getVideoTracks()[0].stop();

    // Set the local video stream as inactive
    setLocalVideoActive(false);
  };

  const stopAudioStream = () => {
    // Stop all audio tracks in the stream
    localStream.getAudioTracks()[0].stop();

    // Set the audio state to inactive
    setLocalAudioActive(false);
  };

  const connectToPeer = async () => {
    try {
      const dataConnection = localPeer.connect(remotePeerId);

      dataConnection.on("open", () => {
        console.log(`Succesfully connected to room (${remotePeerId}).`);
        dataConnection.send(`Succesfully connected to room (${remotePeerId}).`);
      });

      // Handle errors and other events as needed
      dataConnection.on("error", (error) => {
        console.error("Connection error:", error);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setLocalStream(stream);

      const mediaConnection = localPeer.call(remotePeerId, stream);

      // Set the local video stream as active
      setLocalVideoActive(true);

      // Set the stream to your local video element
      localStreamRef.current.srcObject = stream;

      // Handle errors and other events as needed
      mediaConnection.on("error", (error) => {
        console.error("Connection error:", error);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleHangUp = () => {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });

    setLocalVideoActive(false);
    setLocalAudioActive(false);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col w-full text-white bg-black">
        <div className="relative">
          {emptyRoom === true ? (
            <div className="w-full h-[calc(100vh_-_80px)] flex flex-col gap-6 items-center justify-center">
              <h2 className="text-4xl font-bold">The room is empty.</h2>
              <p className="font-bold text-neutral-400">
                Share the room ID to start a call!
              </p>
            </div>
          ) : (
            <>
              <video
                ref={remoteStreamRef}
                className="object-cover w-full h-[calc(100vh_-_80px)]"
                autoPlay
                playsInline
                disablePictureInPicture
              ></video>
              {remoteVideoActive !== true ? (
                <div className="absolute inset-0 flex items-center justify-center font-bold bg-neutral-950">
                  <div className="w-32 h-32 rounded-full bg-neutral-800"></div>
                </div>
              ) : null}
            </>
          )}

          <div className="absolute overflow-hidden bottom-4 left-4 rounded-2xl h-60 w-80">
            <video
              className="object-cover w-full h-full"
              ref={localStreamRef}
              autoPlay
              playsInline
              disablePictureInPicture
              muted
            ></video>
            {localVideoActive !== true ? (
              <div className="absolute inset-0 flex items-center justify-center font-bold bg-neutral-900">
                <div className="w-32 h-32 rounded-full bg-neutral-800"></div>
              </div>
            ) : null}
            <div className="absolute px-2 py-1 text-sm font-bold rounded bottom-4 left-4 bg-neutral-900/20">
              You
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <div>
            <CircularButton
              onClick={() => navigator.clipboard.writeText(localPeerId)}
            >
              Copy Room ID
            </CircularButton>
          </div>
          <div className="flex items-center justify-center gap-4 p-4">
            {localVideoActive === true ? (
              <CircularButton onClick={stopVideoStream}>
                Camera: ON
              </CircularButton>
            ) : (
              <CircularButton onClick={startVideoStream}>
                Camera: OFF
              </CircularButton>
            )}

            {localAudioActive === true ? (
              <CircularButton onClick={stopAudioStream}>Mic: ON</CircularButton>
            ) : (
              <CircularButton onClick={startAudioStream}>
                Mic: OFF
              </CircularButton>
            )}
            <CircularButton onClick={handleHangUp}>Hang Up</CircularButton>
          </div>
          <div className="flex items-center justify-center gap-4">
            <CircularButton>Participants</CircularButton>
            <CircularButton>Chat</CircularButton>
          </div>
        </div>
      </div>
      {modalOpen === true ? (
        <div className="absolute inset-0 flex items-center justify-center w-full text-white bg-black">
          <div className="flex flex-col items-center gap-24 p-12 overflow-hidden rounded-2xl bg-neutral-950">
            {joinRoom === true ? (
              <>
                <h2 className="text-4xl font-bold">Join Room</h2>
                <input
                  className="px-6 py-3 text-black rounded-full w-80"
                  type="text"
                  placeholder="Enter the Room ID"
                  value={remotePeerId}
                  onChange={(event) => setRemotePeerId(event.target.value)}
                />
                <div className="flex flex-col gap-12">
                  <CircularButton
                    className="w-80"
                    onClick={() => {
                      connectToPeer();
                      setModalOpen(false);
                      setEmptyRoom(false);
                      handleCall();
                    }}
                  >
                    Join Room
                  </CircularButton>
                  <CircularButton
                    className="w-80"
                    onClick={() => setJoinRoom(false)}
                  >
                    Go Back
                  </CircularButton>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold">Telemedicine</h2>
                <div className="flex gap-12">
                  <CircularButton
                    className="w-80"
                    onClick={() => setModalOpen(false)}
                  >
                    Create Room
                  </CircularButton>
                  <CircularButton
                    className="w-80"
                    onClick={() => setJoinRoom(true)}
                  >
                    Join Room
                  </CircularButton>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default App;
