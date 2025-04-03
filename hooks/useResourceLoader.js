import { useState, useEffect } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

export default function useResourceLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [resources, setResources] = useState({
    models: {},
    textures: {}
  });

  useEffect(() => {
    const loadResources = async () => {

      const modelPaths = [
        { key: 'car', path: '/assets/car.obj', type: 'obj' },
        { key: 'police_officer', path: '/assets/police_officer.obj', type: 'obj' },
        { key: 'rock', path: '/assets/rock.OBJ', type: 'obj' },
        { key: 'palm_tree', path: '/assets/palm_tree.fbx', type: 'fbx' }
      ];

      const objLoader = new OBJLoader();
      const fbxLoader = new FBXLoader();

      const updateProgress = (loaded, total) => {
        const newProgress = Math.min(100, Math.floor((loaded / total) * 100));
        setProgress(newProgress);
      };

      const totalItems = modelPaths.length;
      let loadedItems = 0;

      const loadedModels = {};

      for (const model of modelPaths) {
        try {
          let obj;
          if (model.type === 'obj') {
            obj = await new Promise((resolve, reject) => {
              objLoader.load(
                model.path,
                (obj) => resolve(obj),
                (xhr) => {

                  if (xhr.lengthComputable) {
                    const modelProgress = xhr.loaded / xhr.total;
                    const itemProgress = modelProgress / totalItems;
                    const overallProgress = (loadedItems / totalItems) + itemProgress;
                    updateProgress(overallProgress * totalItems, totalItems);
                  }
                },
                (error) => reject(error)
              );
            });
          } else if (model.type === 'fbx') {
            obj = await new Promise((resolve, reject) => {
              fbxLoader.load(
                model.path,
                (obj) => resolve(obj),
                (xhr) => {

                  if (xhr.lengthComputable) {
                    const modelProgress = xhr.loaded / xhr.total;
                    const itemProgress = modelProgress / totalItems;
                    const overallProgress = (loadedItems / totalItems) + itemProgress;
                    updateProgress(overallProgress * totalItems, totalItems);
                  }
                },
                (error) => reject(error)
              );
            });
          }

          loadedModels[model.key] = obj;
          loadedItems++;
          updateProgress(loadedItems, totalItems);

        } catch (error) {
          loadedItems++;
          updateProgress(loadedItems, totalItems);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      setResources({
        models: loadedModels,
        textures: {}
      });

      setProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    };

    loadResources();
  }, []);

  return { isLoading, progress, resources };
}
