import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Radio,
  Button,
  Typography,
  Space,
  Progress,
  message,
  Result,
  Spin,
  Alert,
  Divider,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const API_BASE = "http://localhost:8000";

export default function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [reattemptCount, setReattemptCount] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    fetchQuiz();
    fetchHighestScore();
  }, [courseId]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/quiz/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      } else {
        message.error("Quiz not available for this course");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      message.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const fetchHighestScore = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/quiz/highest-score/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setHighestScore(data.highest_score || 0);
        setReattemptCount(data.reattempt_count || 0);
        setCourseCompleted(data.course_completed || false);
      }
    } catch (error) {
      console.error("Error fetching highest score:", error);
    }
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
   
    if (Object.keys(answers).length !== quiz.questions.length) {
      message.warning("Please answer all questions before submitting");
      return;
    }

    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    await submitQuizResult(calculatedScore);
  };

  const submitQuizResult = async (calculatedScore) => {
    try {
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/quiz/submit/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: calculatedScore,
          answers: answers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHighestScore(data.highest_score);
        setReattemptCount(data.reattempt_count);
        
        if (calculatedScore >= 70) {
          message.success(`Congratulations! You passed with ${calculatedScore}%`);
          if (!courseCompleted) {
            setCourseCompleted(true);
            await generateCertificate();
          }
        } else {
          message.warning(`You scored ${calculatedScore}%. Need 70% to pass.`);
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      message.error("Failed to submit quiz results");
    }
  };

  const generateCertificate = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/complete/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
        },
      });
      if (res.ok) {
        message.success("Course completed! Certificate is now available.");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  const handleReattempt = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setSubmitted(false);
    setScore(0);
    message.info("Starting new attempt. Good luck!");
  };

  const handleBackToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Result
          status="warning"
          title="No Quiz Available"
          subTitle="This course doesn't have a quiz yet. Check back later!"
          extra={
            <Button type="primary" onClick={handleBackToCourse}>
              Back to Course
            </Button>
          }
        />
      </div>
    );
  }

  if (submitted) {
    const passed = score >= 70;
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Card style={{ borderRadius: 12 }}>
          <Result
            status={passed ? "success" : "error"}
            icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            title={passed ? "Quiz Completed Successfully!" : "Quiz Completed"}
            subTitle={`Your score: ${score}% (Required: 70% to pass)`}
            extra={[
              <Button key="course" onClick={handleBackToCourse}>
                Back to Course
              </Button>,
              <Button key="reattempt" type="primary" onClick={handleReattempt}>
                Reattempt Quiz
              </Button>,
            ]}
          />

          <Divider />

          <div style={{ marginTop: 24 }}>
            <Title level={4}>Quiz Performance Summary</Title>
            
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text>This Attempt Score</Text>
                <Text strong style={{ color: passed ? "#52c41a" : "#ff4d4f" }}>{score}%</Text>
              </div>
              <Progress percent={score} strokeColor={passed ? "#52c41a" : "#ff4d4f"} showInfo={false} />

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, marginBottom: 8 }}>
                <Text>Highest Score</Text>
                <Text strong style={{ color: "#1890ff" }}>{highestScore}%</Text>
              </div>
              <Progress percent={highestScore} strokeColor="#1890ff" showInfo={false} />

              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Attempts: {reattemptCount}</Text>
              </div>

              {passed && !courseCompleted && (
                <Alert
                  message="Course Completed!"
                  description="Congratulations on passing the quiz! Your certificate is now available in the Completed Courses section."
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>{quiz.title}</Title>
            <TrophyOutlined style={{ fontSize: 24, color: "#faad14" }} />
          </div>
          
          <Progress percent={progress} showInfo={false} />
          
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <Text type="secondary">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Text>
            <Text type="secondary">
              Highest Score: {highestScore}%
            </Text>
          </div>
        </div>

        <Divider />

        <div style={{ marginBottom: 24 }}>
          <Title level={4}>{currentQ.question}</Title>
          
          <Radio.Group
            onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
            value={answers[currentQuestion]}
            style={{ width: "100%", marginTop: 16 }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {currentQ.options.map((option, idx) => (
                <Radio 
                  key={idx} 
                  value={option} 
                  style={{ 
                    display: "block", 
                    padding: "12px 16px", 
                    border: "1px solid #d9d9d9", 
                    borderRadius: 8,
                    width: "100%",
                    marginLeft: 0,
                  }}
                >
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Button
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            size="large"
          >
            Previous
          </Button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length}
              size="large"
              style={{ minWidth: 120 }}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQuestion]}
              size="large"
            >
              Next Question
            </Button>
          )}
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Text type="secondary">
            Answered: {Object.keys(answers).length} / {quiz.questions.length} questions
          </Text>
        </div>
      </Card>
    </div>
  );
}