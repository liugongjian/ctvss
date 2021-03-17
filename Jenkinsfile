pipeline {
  agent any
  environment {
    PROJECT = "vss-user-web"
    CURRENT_VERSION = "vss-v0.2.0"
  }
  stages {
    stage('prepare') {
      parallel {
        stage('unit test') {
          steps {
            echo 'Unit test.'
          }
        }

        stage('static analysis') {
          steps {
            echo 'Program static analysis.'
          }
        }

      }
    }

    stage('build') {
      steps {
        script {
          echo "Package stage."
          if (env.BRANCH_NAME.startsWith('release-') ) {
            env.env = "test"
            env.version = "test"
          }
          if (env.BRANCH_NAME.equals('develop')) {
            env.env = "dev"
            env.version = "0.0.1"
          }
		  if (env.BRANCH_NAME.equals('master')) {
            env.version = "${CURRENT_VERSION}"
          }
		  echo 'Build'
          echo "当前分支：${env.BRANCH_NAME}"
          echo "当前任务：${env.JOB_NAME}"
          echo "当前版本：${env.version}"
          echo "当前环境：${env.env}"
		  sh 'npm install'
		  sh 'npm run build:stage'
		}
      }
    }

    stage('deploy') {
      when {
        expression {
          env.env.equals('test')
        }
      }
      steps {
        echo 'Deployment.'
        script {
          sh "rm -rf /data1/test/static/test/user"
          sh "cp -r dist /data1/test/static/test/user"
        }
      }
    }
    
    stage('test') {
      when {
        expression {
          env.env.equals('test')
        }
      }
      steps {
        build 'vss-ui-at'
      }
    }
    
    stage('tag') {
      when {
        expression {
          env.BRANCH_NAME.equals('master')
        }
      }
      steps {
        wrap([$class: 'BuildUser']) {
          sh("git tag -a ${env.version} -m 'Release version ${env.version}'")
          sh("git push origin ${env.version}")
        }
      }
    }
  }
}
