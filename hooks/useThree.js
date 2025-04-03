import { useEffect, useRef, useState, useCallback } from 'react';

import SceneManager from '../components/three/core/Scene';
import RendererManager from '../components/three/core/Renderer';
import CameraManager from '../components/three/core/Camera';
import LightsManager from '../components/three/core/Lights';
import Car from '../components/three/objects/Cars';
import Road from '../components/three/objects/Road';
import ObstacleManager from '../components/three/objects/Obstacle';
import Streetlight from '../components/three/objects/StreetLight';
import PalmTrees from '../components/three/objects/PalmTrees';
import SynthwaveMountains from '../components/three/objects/SynthwaveMountains';
import GameController from '../components/three/controllers/GameController';
import PostProcessingManager from '../components/three/effects/PostProcessing';
import CustomShaders from '../components/three/effects/CustomShaders';

export default function useThree(containerRef, preloadedResources = {}, isReady = false) {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const lightsRef = useRef(null);
  const carRef = useRef(null);
  const roadRef = useRef(null);
  const obstaclesRef = useRef(null);
  const streetlightsRef = useRef(null);
  const palmTreesRef = useRef(null);
  const mountainsRef = useRef(null);
  const gameControllerRef = useRef(null);
  const postProcessingRef = useRef(null);
  const customShadersRef = useRef(null);
  const animationFrameRef = useRef(null);
  const initialized = useRef(false);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const moveCarLeft = useCallback(() => {
    if (carRef.current) {
      carRef.current.moveLeft();
    }
  }, []);

  const moveCarRight = useCallback(() => {
    if (carRef.current) {
      carRef.current.moveRight();
    }
  }, []);

  useEffect(() => {

    if (!containerRef.current || !isReady || initialized.current) return;

    initialized.current = true;

    const init = async () => {
      try {

        sceneRef.current = new SceneManager();
        rendererRef.current = new RendererManager(containerRef.current);
        cameraRef.current = new CameraManager(containerRef.current);
        lightsRef.current = new LightsManager(sceneRef.current.get());
        roadRef.current = new Road(sceneRef.current.get());

        await new Promise(resolve => setTimeout(resolve, 100));

        const lanePositions = roadRef.current.getLanePositions();

        carRef.current = new Car(
          sceneRef.current.get(),
          preloadedResources.models?.car
        );
        carRef.current.setLanePositions(lanePositions);

        obstaclesRef.current = new ObstacleManager(
          sceneRef.current.get(),
          roadRef.current,
          preloadedResources.models
        );

        obstaclesRef.current.updateLanePositions(lanePositions);
        streetlightsRef.current = new Streetlight(sceneRef.current.get(), roadRef.current);
        mountainsRef.current = new SynthwaveMountains(sceneRef.current.get(), roadRef.current);

        if (preloadedResources.models?.palm_tree) {
          palmTreesRef.current = new PalmTrees(
            sceneRef.current.get(),
            roadRef.current,
            preloadedResources.models.palm_tree
          );
        }

        customShadersRef.current = new CustomShaders();

        postProcessingRef.current = new PostProcessingManager(
          rendererRef.current.get(),
          sceneRef.current.get(),
          cameraRef.current.get()
        );

        gameControllerRef.current = new GameController(
          carRef.current,
          roadRef.current,
          obstaclesRef.current,
          cameraRef.current
        );

        gameControllerRef.current.onScoreUpdate = (newScore) => {
          setScore(newScore);
        };

        gameControllerRef.current.onGameOver = () => {
          setGameOver(true);
        };

        let lastTime = 0;
        const animate = (time) => {
          const deltaTime = (time - lastTime) / 1000;
          lastTime = time;

          if (customShadersRef.current) {
            customShadersRef.current.updateTime(time / 1000);
          }

          if (roadRef.current) roadRef.current.update();
          if (carRef.current) carRef.current.update();
          if (obstaclesRef.current) obstaclesRef.current.update();
          if (streetlightsRef.current) streetlightsRef.current.update();
          if (palmTreesRef.current) palmTreesRef.current.update();
          if (mountainsRef.current) mountainsRef.current.update();

          if (gameControllerRef.current) {
            gameControllerRef.current.update(deltaTime);
          }

          if (sceneRef.current) {
            sceneRef.current.animateSun(time * 0.001);
          }

          if (postProcessingRef.current) {
            postProcessingRef.current.render();
          } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current.get(), cameraRef.current.get());
          }

          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

      } catch (error) {
      }
    };

    init();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (cameraRef.current) {
        cameraRef.current.dispose();
      }

      initialized.current = false;
    };
  }, [containerRef, preloadedResources, isReady]);


  const resetGame = () => {
    if (gameControllerRef.current) {
      gameControllerRef.current.reset();
      setGameOver(false);
      setScore(0);
    }
  };

  return { score, gameOver, resetGame, moveCarLeft, moveCarRight };
}
