pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                echo 'Repository cloned successfully'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    bat 'docker build -t smart-expense-backend .'
                }
            }
        }

        stage('Build Successful') {
            steps {
                echo 'CI/CD Pipeline executed successfully!'
            }
        }
    }
}