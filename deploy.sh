#1. build images, tag them and push to docker-hub    
    #1.A building our images
docker build -t eumb602/multi-client:latest -t eumb602/multi-client:$SHA -f ./client/Dockerfile ./client
        #first tag (eumb602/multi-client:latest) appended LATEST word.
        #second tag (eumb602/multi-client:$SHA) appended the GIT_SHA; $SHA is a global variable defined
        #in .travis.yml file
docker build -t eumb602/multi-server:latest -t eumb602/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t eumb602/multi-worker:latest -t eumb602/multi-worker:$SHA -f ./worker/Dockerfile ./worker
    #this docker command is the same that we configured inside the .travis.yml file
    #wo we have no need to login again

    #1.B. taking those images  and push them to docker-hub
docker push eumb602/multi-client:latest
docker push eumb602/multi-server:latest
docker push eumb602/multi-worker:latest

docker push eumb602/multi-client:$SHA #lecture 242
docker push eumb602/multi-server:$SHA
docker push eumb602/multi-worker:$SHA
#2.Apply all configs in the k8s folder
    #applying all config files. We do not care about kubectl because
    #we have cinstalled this on the -travis.yml
kubectl apply -f k8s

#3. Imperatively set latest version on each deployment
kubectl set image deployments/server-deployment server=stephengrider/multi-server #:$SHA
    #we are setting a specific image to the deployments and specifically
    #the deployment called server-deployment (which has been set on 
    #folder k8s in the file server-deployment in the metadata section in the 
    #name field) and then select the CONTAINER which name is server and
    #we tell it to use the image eumb602/multi-server (image that we have just uploaded)=>see 240 lecture
kubectl set image deployments/client-deployment client=stephengrider/multi-client #:$SHA
kubectl set image deployments/worker-deployment worker=stephengrider/multi-worker #:$SHA
