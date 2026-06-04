import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Progress,
  Tag,
  Space,
  Collapse,
  message,
  Spin,
  Modal,
  Empty,
  Alert,
  Tooltip,
} from "antd";
import {
  PlayCircleOutlined,
  FilePdfOutlined,
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  RightOutlined,
  UserOutlined,
  VideoCameraOutlined,
  StarOutlined,
  RocketOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const API_BASE = "http://localhost:8000";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [activeKeys, setActiveKeys] = useState([]);
  const [isStartingLearning, setIsStartingLearning] = useState(false);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);


  useEffect(() => {
      fetchCourseDetails();
      fetchCourseLessons();
      checkEnrollmentAndProgress();
    }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("lms_token");

      const res = await fetch(`${API_BASE}/api/courses/${courseId}/`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        if (Array.isArray(data.lessons)) {
          setLessons(data.lessons);
        }
      } else if (res.status === 404) {
        message.error("Course not found");
        navigate("/student/explore");
      } else {
        const errorData = await res.json().catch(() => ({}));
        message.error(errorData.message || "Failed to load course details");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      message.error("Network error - Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseLessons = async () => {
    try {
      const token = localStorage.getItem("lms_token");

      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch(`${API_BASE}/api/courses/${courseId}/lessons/`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setLessons(Array.isArray(data) ? data : []);
      } else {
        const txt = await res.text().catch(() => "");
        console.error("Failed to fetch lessons", res.status, txt);
        setLessons([]);
        message.error("Failed to load lessons for this course.");
      }
    } catch (error) {
      console.error("Error fetching course lessons:", error);
      setLessons([]);
      message.error("Network error while loading lessons.");
    }
  };

  const checkEnrollmentAndProgress = async () => {
    try {
      const token = localStorage.getItem("lms_token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/me/enrollments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        const enrolled = data.find((e) => e.course?.id === parseInt(courseId));
        setEnrollmentStatus(enrolled ? "enrolled" : "not_enrolled");
        
        if (enrolled) {
          setProgress(enrolled.progress || 0);
          // Fetch detailed progress including completed lesson IDs
          await fetchCourseProgress();
        }
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      const token = localStorage.getItem("lms_token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/courses/progress/${courseId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProgress(Math.round(data.progress_percentage) || 0);
        setCompletedLessons(data.completed_lesson_ids || []);
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  };

  const confirmEnrollmentAndEnroll = () => {
    Modal.confirm({
      title: "Confirm Enrollment",
      content: "Are you sure you want to enroll in this course?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => handleEnroll(),
    });
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const token = localStorage.getItem("lms_token");
      
      if (!token) {
        message.error("Please login to enroll");
        navigate("/signin");
        return;
      }

      // Check if already enrolled
      if (enrollmentStatus === "enrolled") {
        message.info("You are already enrolled in this course.");
        setEnrolling(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/me/enrollments/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course: parseInt(courseId) }),
      });

      if (res.ok) {
        message.success("Successfully enrolled.");
        setEnrollmentStatus("enrolled");
        setProgress(0);
        setCompletedLessons([]);
        await fetchCourseDetails();
        await fetchCourseLessons();
        await checkEnrollmentAndProgress();
        await fetchCourseProgress();
      } else if (res.status === 400 || res.status === 409) {
        // Already enrolled - update state
        message.info("You are already enrolled in this course.");
        setEnrollmentStatus("enrolled");
        await checkEnrollmentAndProgress();
      } else {
        const errorData = await res.json().catch(() => ({}));
        message.error(errorData.error || "Enrollment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      message.error("Network error - Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (enrollmentStatus !== "enrolled") {
      Modal.confirm({
        title: "Enrollment Required",
        content: "Please enroll in the course to start learning.",
        okText: "Enroll Now",
        cancelText: "Cancel",
        onOk: handleEnroll,
      });
      return;
    }
    setIsStartingLearning(true);
    document.getElementById("lessons-section")?.scrollIntoView({ 
      behavior: "smooth",
      block: "start",
    });
    setTimeout(() => setIsStartingLearning(false), 500);
  };

  const handleStartQuiz = () => {
    if (enrollmentStatus !== "enrolled") {
      Modal.confirm({
        title: "Enrollment Required",
        content: "Please enroll in the course to take the quiz.",
        okText: "Enroll Now",
        cancelText: "Cancel",
        onOk: handleEnroll,
      });
      return;
    }

    if (progress < 80) {
      Modal.info({
        title: "Quiz Locked",
        content: `Complete at least 80% of the course to attempt the quiz. Current progress: ${progress}%`,
        okText: "Continue Learning",
        onOk: handleStartLearning,
      });
      return;
    }
    setIsStartingQuiz(true);
    navigate(`/quiz/${courseId}`);
  };

  const handleContinueLearning = () => {
    document.getElementById("lessons-section")?.scrollIntoView({ 
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAttemptQuiz = () => {
    if (progress < 80) {
      Modal.info({
        title: "Quiz Locked",
        content: `Complete at least 80% of the course to attempt the quiz. Current progress: ${progress}%`,
        okText: "Continue Learning",
        onOk: handleContinueLearning,
      });
      return;
    }
    navigate(`/quiz/${courseId}`);
  };

  const handleLessonComplete = async (lessonId) => {
    if (enrollmentStatus !== "enrolled") {
      Modal.confirm({
        title: "Enrollment Required",
        content: "Please enroll in the course to mark lessons as complete.",
        okText: "Enroll Now",
        cancelText: "Cancel",
        onOk: handleEnroll,
      });
      return;
    }

    if (completedLessons.includes(lessonId)) return;

    const newCompletedLessons = [...completedLessons, lessonId];
    setCompletedLessons(newCompletedLessons);

    const totalLessons = course?.lessons?.length || 1;
    const newProgress = Math.min(100, Math.floor((newCompletedLessons.length / totalLessons) * 100));
    setProgress(newProgress);

    message.success(`Lesson completed! Progress: ${newProgress}%`);

    try {
      await fetch(`${API_BASE}/api/courses/lessons/complete/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lms_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson: lessonId,
        }),
      });
      // Refresh progress from server after lesson completion is recorded
      await fetchCourseProgress();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleAccessContent = (contentType) => {
    // Content visibility is allowed for all users.
    // Enrollment is still required for actions like progress/quiz.
    return true;
  };

  const getProgressColor = () => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 50) return "#faad14";
    return "#1890ff";
  };

  // Track progress percentage display
  const getTrackProgressMessage = () => {
    if (progress === 0) return "Not started yet";
    if (progress < 30) return "Just getting started! Keep going! ";
    if (progress < 60) return "Making good progress! ";
    if (progress < 80) return "Almost there! You're doing great! ";
    if (progress < 100) return "So close to completion! 🎯";
    return "Course completed! Excellent work! 🎉";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Empty 
          description="Course not found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate("/student/explore")}>
            Browse Courses
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          padding: "32px",
          color: "white",
        }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={8}>
              <img
                src={course.thumbnail_url || course.thumbnail || "https://via.placeholder.com/400x300?text=Course"}
                alt={course.title}
                style={{ 
                  width: "100%", 
                  borderRadius: 12, 
                  objectFit: "cover",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  aspectRatio: "4/3",
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
            </Col>
            <Col xs={24} md={16}>
              <Title level={2} style={{ color: "white", marginBottom: 16 }}>
                {course.title}
              </Title>
              <Space wrap size={8} style={{ marginBottom: 16 }}>
                <Tag icon={<BookOutlined />} color="cyan">{course.category}</Tag>
                <Tag icon={<StarOutlined />} color="gold">{course.level}</Tag>
                <Tag icon={<ClockCircleOutlined />} color="green">{course.duration} Hours</Tag>
                <Tag icon={<UserOutlined />} color="blue">
                  {course.enrollment_count || 0} Students
                </Tag>
              </Space>
              <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
                {course.description}
              </Paragraph>

              {enrollmentStatus === "enrolled" && (
                <div style={{ marginTop: 20, background: "rgba(255,255,255,0.2)", padding: 16, borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text strong style={{ color: "white", fontSize: 14 }}>Your Progress</Text>
                    <Text strong style={{ color: "#ffd700", fontSize: 18 }}>{progress}%</Text>
                  </div>
                  <Progress 
                    percent={progress} 
                    strokeColor="#ffd700"
                    showInfo={false}
                    trailColor="rgba(255,255,255,0.3)"
                    strokeWidth={6}
                  />
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.9)" }}>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                      ✅ {completedLessons.length} of {lessons.length} lessons completed
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                      {lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0}% done
                    </Text>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.8)", fontStyle: "italic" }}>
                    {getTrackProgressMessage()}
                  </div>
                </div>
              )}

              <Space size={16} style={{ marginTop: 24 }}>
                {enrollmentStatus === "enrolled" ? (
                  <>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<CheckCircleOutlined />}
                      disabled
                      style={{ 
                        backgroundColor: "#52c41a", 
                        borderColor: "#52c41a",
                        height: 48,
                        fontSize: 16,
                        color: "white",
                      }}
                    >
                      Enrolled
                    </Button>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<RocketOutlined />}
                      onClick={handleStartLearning}
                      loading={isStartingLearning}
                      style={{ 
                        backgroundColor: "#1890ff", 
                        borderColor: "#1890ff",
                        height: 48,
                        fontSize: 16,
                      }}
                    >
                      Start Learning
                    </Button>
                    <Button 
                      type="default"
                      size="large" 
                      icon={<ExperimentOutlined />}
                      onClick={handleStartQuiz}
                      loading={isStartingQuiz}
                      disabled={progress < 80}
                      style={{ 
                        height: 48,
                        fontSize: 16,
                        backgroundColor: progress >= 80 ? "#faad14" : "#d9d9d9",
                        borderColor: progress >= 80 ? "#faad14" : "#d9d9d9",
                        color: progress >= 80 ? "white" : "#999",
                      }}
                    >
                      Start Test {progress < 80 && `(${progress}% Required)`}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<BookOutlined />}
                      onClick={confirmEnrollmentAndEnroll}
                      loading={enrolling}
                      style={{ 
                        height: 48,
                        fontSize: 16,
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                      }}
                    >
                      Enroll Now
                    </Button>
                    <Button 
                      type="default"
                      size="large" 
                      icon={<RocketOutlined />}
                      onClick={handleStartLearning}
                      style={{ 
                        height: 48,
                        fontSize: 16,
                      }}
                    >
                      Start Learning
                    </Button>
                    <Button 
                      type="default"
                      size="large" 
                      icon={<ExperimentOutlined />}
                      onClick={handleStartQuiz}
                      style={{ 
                        height: 48,
                        fontSize: 16,
                      }}
                    >
                      Start Quiz
                    </Button>
                  </>
                )}
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {enrollmentStatus === "enrolled" && (
        <Card 
          style={{ 
            marginBottom: 24, 
            borderRadius: 16,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              📊 Your Learning Progress
            </Title>
            <Progress 
              type="circle" 
              percent={progress} 
              strokeColor={getProgressColor()}
              format={(percent) => `${percent}%`}
              width={120}
            />
            <div style={{ marginTop: 20 }}>
              <Text strong style={{ fontSize: 16, display: "block", marginBottom: 8 }}>
                {getTrackProgressMessage()}
              </Text>
              <Space split="•">
                <Text type="secondary">
                  ✅ Completed: {completedLessons.length} / {lessons.length || 0} lessons
                </Text>
                <Text type="secondary">
                  {progress === 100 ? "🏆 Certificate Ready!" : "🎯 Keep pushing forward!"}
                </Text>
              </Space>
              {progress > 0 && progress < 100 && (
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">
                    {100 - progress}% more to complete the course!
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div id="lessons-section">
        <Card 
          style={{ 
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <VideoCameraOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              <span style={{ fontSize: 18, fontWeight: 600 }}>Course Lessons</span>
              {enrollmentStatus === "enrolled" && (
                <Tag color="green" style={{ marginLeft: 12 }}>
                  {completedLessons.length} / {course.lessons?.length || 0} Completed
                </Tag>
              )}
            </div>
          }
        >
          {enrollmentStatus !== "enrolled" && (
            <Alert
              message="Preview Available"
              description="You can view lesson content and materials, but you need to enroll to get certification."
              type="info"
              showIcon
              style={{ marginBottom: 24, borderRadius: 12 }}
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={confirmEnrollmentAndEnroll}
                  loading={enrolling}
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                  }}
                >
                  Enroll Now
                </Button>
              }
            />
          )}

          {lessons && lessons.length > 0 ? (

            <Collapse
              accordion
              onChange={(keys) => setActiveKeys(keys)}
              expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
              style={{ borderRadius: 12 }}
              expandIconPosition="end"
            >
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const canAccess = true;

                return (
                  <Panel
                    key={index}
                    header={
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        width: "100%",
                        paddingRight: 24,
                      }}>
                        <Space>
                          {isCompleted ? (
                            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
                          ) : (
                            <UnlockOutlined style={{ color: "#1890ff", fontSize: 18 }} />
                          )}
                          <Text strong style={{ fontSize: 16 }}>Lesson {index + 1}: {lesson.title}</Text>
                        </Space>
                        {isCompleted && <Tag color="success" style={{ borderRadius: 12 }}>Completed</Tag>}
                      </div>
                    }
                  >
                    <div style={{ padding: "16px 0" }}>
                      <Paragraph style={{ fontSize: 15, color: "#555" }}>
                        {lesson.description || "No description available for this lesson."}
                      </Paragraph>

                    
                      <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ fontSize: 16, display: "block", marginBottom: 12 }}>
                          <VideoCameraOutlined style={{ marginRight: 8 }} />
                          Video Content
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          {lesson.video_url ? (
                            <video 
                              controls 
                              style={{ width: "100%", borderRadius: 12, maxHeight: 400 }} 
                              src={lesson.video_url}
                              poster={course.thumbnail_url}
                              onEnded={() => handleLessonComplete(lesson.id)}
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <div style={{ 
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                              padding: 40, 
                              textAlign: "center", 
                              borderRadius: 12,
                              color: "white",
                            }}>
                              <PlayCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                              <p style={{ margin: 0 }}>Video content will be added soon</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ fontSize: 16, display: "block", marginBottom: 12 }}>
                          <FilePdfOutlined style={{ marginRight: 8 }} />
                          Course Material
                        </Text>
                        <div>
                          {lesson.material_url ? (
                            <Button 
                              icon={<FilePdfOutlined />} 
                              href={lesson.material_url} 
                              target="_blank"
                              type="link"
                              style={{ paddingLeft: 0 }}
                            >
                              Download Lesson Material
                            </Button>
                          ) : (
                            <Text type="secondary">No material available for this lesson</Text>
                          )}
                        </div>
                      </div>

                      {canAccess && !isCompleted && (
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleLessonComplete(lesson.id)}
                          style={{ 
                            marginTop: 8,
                            backgroundColor: "#52c41a",
                            borderColor: "#52c41a",
                          }}
                        >
                          Mark Lesson as Complete
                        </Button>
                      )}
                      
                      {isCompleted && (
                        <Alert
                          message="Lesson Completed"
                          description="Great job! Keep going to complete the course."
                          type="success"
                          showIcon
                          style={{ marginTop: 16, borderRadius: 8 }}
                        />
                      )}
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
          ) : (
            <Empty 
              description="No lessons available for this course yet" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
}