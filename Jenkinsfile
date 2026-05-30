pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'food-ordering-webapp'
        DOCKER_TAG = "v${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from the repository
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Next.js Webapp Docker Image...'
                // Build the image using the Dockerfile
                script {
                    sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ./backend'
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                echo 'Testing the Docker image to ensure it runs...'
                // Simple run to ensure the image doesn't immediately crash
                script {
                    sh 'docker run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} echo "Docker image built and ran successfully!"'
                }
            }
        }
        
        stage('Deploy & Push to Docker Hub') {
            steps {
                echo 'Deploying image to Docker Hub...'
                script {
                    // NOTE: Make sure to add Docker Hub credentials in Jenkins
                    // with the ID 'docker-hub-credentials'
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        // Push to Docker Hub with your username prefix
                        sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                        sh "docker tag ${DOCKER_IMAGE}:latest ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
                        sh "docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                        sh "docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution complete.'
        }
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed. Please check the logs.'
        }
    }
}
