docker build -t eumb602/multi-client:latest -t eumb602/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t eumb602/multi-server:latest -t eumb602/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t eumb602/multi-worker:latest -t eumb602/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push eumb602/multi-client:latest
docker push eumb602/multi-server:latest
docker push eumb602/multi-worker:latest

docker push eumb602/multi-client:$SHA
docker push eumb602/multi-server:$SHA
docker push eumb602/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=eumb602/multi-server:$SHA
kubectl set image deployments/client-deployment client=eumb602/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=eumb602/multi-worker:$SHA

