# Containerized Online Food Ordering Microservices Application

This project is a modern, web-based Online Food Ordering System built on a **Microservices Architecture** and heavily integrating **DevOps practices**. It automates the software development lifecycle using CI/CD pipelines (Jenkins & GitHub Actions) and relies on Docker containerization for reliable deployment.

---

## 🏗️ Architecture Overview
The application separates its infrastructural components into fully independent, containerized services:
1. **Frontend UI**: Built with HTML5, Vanilla JavaScript, and Bootstrap 5. Served statically via Nginx.
2. **Backend Microservices**: A single Node.js/Express codebase that is instantiated into three independent microservices (`user-service`, `menu-service`, `order-service`) running on internal Docker network ports.
3. **Database Layer**: MongoDB (Primary Database) and Redis (Caching Layer).
4. **Reverse Proxy / API Gateway**: Nginx routes incoming frontend traffic to the static files and proxies `/api/*` traffic to the appropriate backend microservices.

---

## 🛠️ Technologies Used
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Databases**: MongoDB (NoSQL), Redis (In-memory Cache)
- **Containerization**: Docker, Docker Compose
- **Web Server / Proxy**: Nginx
- **CI/CD Automation**: Jenkins, GitHub Actions
- **Version Control**: Git, GitHub

---

## 🚀 Setup & Execution Commands

### Prerequisites
- Docker & Docker Desktop installed.
- Git installed.

### 1. Running the Application Locally
To start the entire microservices cluster, open your terminal in the root directory and run:
```bash
# Build and start all 5 containers in detached mode
docker-compose up -d --build
```
*This command pulls the MongoDB, Redis, and Nginx images from DockerHub, builds our custom Node.js backend image from the local `Dockerfile`, and starts the network.*

### 2. Accessing the Application
Once the containers are running, access the web application at:
- **URL**: `http://localhost:3001`

### 3. Seeding the Database
Because the MongoDB database starts empty, you must inject the initial food menu. Click the **"Seed Database"** button on the frontend UI, or run this API command:
```powershell
# Using PowerShell
Invoke-RestMethod -Method POST http://localhost:3001/api/menu/seed

# Or using Curl
curl -X POST http://localhost:3001/api/menu/seed
```

### 4. Stopping the Application
To stop the application and clean up the containers:
```bash
docker-compose down
```

---

## ⚙️ DevOps & CI/CD Pipelines

To automate the testing, building, and deployment of our custom Docker image, we implemented continuous integration pipelines using both **Jenkins** and **GitHub Actions**.

### GitHub Actions (`.github/workflows/ci.yml`)
- **Trigger**: Activates automatically on a `push` or `pull_request` to the `main` branch.
- **Workflow**: 
  1. Checks out the repository.
  2. Sets up Docker Buildx.
  3. Builds the custom Node.js backend Docker image.
  4. Tests the image.
  5. Pushes the built image to Docker Hub (if secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are provided).

### Jenkins Pipeline (`Jenkinsfile`)
- **Trigger**: Can be triggered manually or via GitHub Webhooks.
- **Workflow**:
  1. **Checkout**: Pulls the latest code from the GitHub repository.
  2. **Build Docker Image**: Runs `docker build -t food-ordering-webapp:latest ./backend`.
  3. **Test Docker Image**: Spins up a temporary container to verify the build runs without crashing.
  4. **Deploy & Push**: Connects to Docker Hub using the `docker-hub-credentials` securely stored in Jenkins, and executes `docker push` to upload the image to the remote registry.

---

## 💻 Important Commands Used (For Project Report)

Here are the critical commands used during the development and execution of this project:

**Git & Version Control**
```bash
git init                                   # Initialize the local repository
git add .                                  # Stage all files for commit
git commit -m "Initial commit"             # Commit changes locally
git branch -M main                         # Rename master branch to main
git remote add origin <GITHUB_URL>         # Link to remote GitHub repository
git push -u origin main                    # Push code to GitHub
```

**Docker Container Management**
```bash
docker build -t my-app:latest ./backend    # Manually build the custom backend image
docker ps                                  # List all actively running containers
docker-compose up -d --build               # Build and orchestrate all microservices
docker-compose down                        # Stop and remove all microservices
```

**Fixing Docker-in-Docker Permissions (Jenkins Troubleshooting)**
*If Jenkins runs inside a Docker container, it needs permissions to access the host's Docker socket to build images.*
```bash
# Granting the Jenkins container permission to run Docker commands
docker exec -u root <JENKINS_CONTAINER_ID> chmod 666 /var/run/docker.sock
```

**Clearing the Redis Cache Manually**
```bash
# Access the Redis container and flush all cached menu items
docker exec food_ordering_redis redis-cli FLUSHALL
```
