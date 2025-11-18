# ⎈ Buggy App Challenge in Kubernetes

## Problem

You are tasked with deploying a frontend-backend application stack in Kubernetes. The stack is buggy and has several misconfigurations that need to be identified and resolved.

### Backend
#### Responsible for providing information about some Kubernetes resources via a REST API.
- Container port: `8000`
- Supported routes: `/pods`, `/services`, `/events`, `/health`, `/ready`
- Requires auth: `true`

### Frontend
#### A Kubernetes dashboard that displays information fetched from the backend service.
- Container port: `3000`
- Supported routes: `/health`, `/` 

#### Container registry read token:
> name: `buggy-app-challenge`  
> value: `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`

---

## Task Requirements
Make sure you fulfill the following requirements:  

ⓘ _Use appropriately `buggy-app-backend` and `buggy-app-frontend` names for Kubernetes resources._

**Backend**
- [ ] Use `buggy-app-challenge` namespace 
- [ ] Configure a readiness probe for path `/health` 
- [ ] Configure a liveness probe for path `/ready`
- [ ] Set requests and limits on the container resources
- [ ] Configure autoscaling at 70% of CPU utilization

**Frontend**
- [ ] Use `buggy-app-challenge` namespace
- [ ] Configure a readiness probe for path `/health`
- [ ] Configure a liveness probe on the TCP socket
- [ ] Set requests and limits on the container resources
- [ ] Expose the frontend application via ingress under 
- [ ] The frontend application must be accessible under `http://buggy-app.challenge:30088`

**IMPORTANT: All resources must be defined in YAML manifests, to allow anyone to successfully set up and run the stack via kubectl apply -f ...**

## Before You Submit
Before submit this challenge, run the validation scrip located in [releases](https://github.com/hayk96/buggy-app-challenge/releases/) to make sure all requirements are met:


```shell
$ ./validate-challenge-0.1.0-linux-amd64 --kubeconfig /path/to/your/kubeconfig
```

## License
Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Author and maintainer
**Hayk Davtyan | [@hayk96](https://github.com/hayk96)**