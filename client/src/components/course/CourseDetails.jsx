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

// Consider moving this to an .env file for production
const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:8000";

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
  const [nextLessonId, setNextLessonId] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
    fetchCourseLessons();
    checkEnrollmentAndProgress();
    fetchCourseQuiz();
  }, [courseId]);

  const fetchCourseQuiz = async () => {
    try {
      const token = localStorage.getItem("lms_token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/quiz/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setQuizInfo(data);
      } else {
        setQuizInfo(null);
      }
    } catch (e) {
      console.error("Error fetching quiz info:", e);
      setQuizInfo(null);
    }
  };

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
      if (!token) return false;

      const res = await fetch(`${API_BASE}/api/me/enrollments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Enrollment check failed", res.status, await res.text().catch(() => ""));
        return false;
      }

      const data = await res.json();
      const enrollments = Array.isArray(data) ? data : data.results || [];
      const enrolled = enrollments.find((e) => {
        const courseIdentifier = e.course?.id || e.course_id;
        return parseInt(courseIdentifier) === parseInt(courseId);
      });
      const isEnrolled = Boolean(enrolled);
      setEnrollmentStatus(isEnrolled ? "enrolled" : "not_enrolled");

      if (isEnrolled) {
        setProgress(enrolled.progress || 0);
        await fetchCourseProgress();
      }
      return isEnrolled;
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
    return false;
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
        const rawServer = (data.progress_percentage !== undefined && data.progress_percentage !== null)
          ? Math.round(data.progress_percentage)
          : 0;
        
        const completedIds = (data.completed_lesson_ids || []).map(id => Number(id));
        const totalLessonsCount = lessons.length || (course?.lessons?.length) || 0;
        const calculated = totalLessonsCount > 0 ? Math.round((completedIds.length / totalLessonsCount) * 100) : 0;
        
        // Ensure that if any lesson is completed, we show at least 1%
        const finalProgress = (completedIds.length > 0) ? Math.max(1, Math.max(rawServer, calculated)) : 0;

        setProgress(finalProgress);
        // Ensure all IDs are stored as Numbers for consistent 'includes' checks
        setCompletedLessons(completedIds);
        setNextLessonId(data.next_lesson_id);
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

      const alreadyEnrolled = await checkEnrollmentAndProgress();
      if (alreadyEnrolled) {
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
        body: JSON.stringify({ course_id: parseInt(courseId) }),
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
      } else {
        const errorData = await res.json().catch(() => ({}));
        const serverMessage = errorData.error || errorData.detail || errorData.course || "Enrollment failed. Please try again.";
        if (res.status === 400 || res.status === 409) {
          message.info(serverMessage || "You are already enrolled in this course.");
          const enrolled = await checkEnrollmentAndProgress();
          if (enrolled) {
            setEnrollmentStatus("enrolled");
          }
        } else {
          message.error(serverMessage);
        }
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
    navigate(`/student/quiz/${courseId}`); // Consistent route
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
    navigate(`/student/quiz/${courseId}`);
  };

  const handleLessonComplete = async (lessonId) => {
    if (enrollmentStatus !== "enrolled") {
      Modal.warning({
        title: "Enrollment Required",
        content: "Please enroll in the course to mark lessons as complete.",
      });
      return;
    }

    if (completedLessons.includes(Number(lessonId))) return;

    try {
      const token = localStorage.getItem("lms_token");
      if (!token) {
        message.error("Please login to save lesson progress.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/courses/lessons/complete/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson: parseInt(lessonId),
          course: parseInt(courseId),
          lesson_id: Number(lessonId),
          course_id: Number(courseId),
        }),
      });

      if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
              message.error("Session expired or unauthorized. Please sign in again.");
              return;
          }
          
          const errText = await res.text().catch(() => "");
          let err = {};
          if (errText && errText.trim().startsWith('{')) {
              try { 
                  err = JSON.parse(errText); 
              } catch(e) { 
                  err = { detail: "An unexpected server error occurred." }; 
              }
          } else {
              err = { detail: "The server encountered an error and could not process your request." };
          }
          
          message.error(
              err.error || err.detail || err.lesson || "Failed to mark lesson as complete. Please try again later."
          );
          return;
      }

      const data = await res.json();
      
      // Merge server data with local state to ensure the current lesson is accounted for
      const serverCompletedIds = (data.completed_lesson_ids || []).map(id => Number(id));
      const updatedList = Array.from(new Set([...completedLessons, ...serverCompletedIds, Number(lessonId)]));
      
      setCompletedLessons(updatedList);
      setNextLessonId(data.next_lesson_id || null);
      
      // Calculate total lessons and local progress fallback
      const totalLessonsCount = lessons.length || (course?.lessons?.length) || 0;
      const localCalc = totalLessonsCount > 0 ? Math.round((updatedList.length / totalLessonsCount) * 100) : 0;
      
      const serverProgress = (data.progress_percentage !== undefined && data.progress_percentage !== null)
        ? Math.round(parseFloat(data.progress_percentage))
        : 0;

      // Ensure we don't display 0% if at least one lesson is finished
      const currentProgress = updatedList.length > 0 ? Math.max(1, Math.max(serverProgress, localCalc)) : 0;

      setProgress(currentProgress);
      message.success(`Lesson marked as complete! (${currentProgress}%)`);

      // Silently refresh progress details in the background
      fetchCourseProgress().catch(() => null);
    } catch (error) {
      console.error("Error updating progress:", error);
      message.error("Network error - Unable to save lesson progress.");
    }
  };

  const getProgressColor = () => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 50) return "#faad14";
    return "#1890ff";
  };

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
    <div style={{ 
      maxWidth: 1200, 
      margin: "0 auto", 
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f0f2f5"
    }}>
      {/* Fixed Header Card */}
      <div style={{ flexShrink: 0, padding: "16px 24px 0 24px" }}>
        <Card 
          style={{ 
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            padding: "24px 32px",
            color: "white",
          }}>
            <Row gutter={[24, 24]}>
              {/* Left Column - Course Info */}
              <Col xs={24} lg={16}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <img
                      src={course.thumbnail_url || course.thumbnail || "https://via.placeholder.com/400x300?text=Course"}
                      alt={course.title}
                      style={{ 
                        width: "100%", 
                        borderRadius: 12, 
                        objectFit: "cover",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                        maxHeight: 150,
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Title level={3} style={{ color: "white", marginBottom: 8, marginTop: 0 }}>
                      {course.title}
                    </Title>
                    <Space wrap size={8} style={{ marginBottom: 12 }}>
                      <Tag icon={<BookOutlined />} color="cyan">{course.category}</Tag>
                      <Tag icon={<StarOutlined />} color="gold">{course.level}</Tag>
                      <Tag icon={<ClockCircleOutlined />} color="green">{course.duration} Hours</Tag>
                      <Tag icon={<UserOutlined />} color="blue">
                        {course.enrollment_count || 0} Students
                      </Tag>
                      {quizInfo && (
                        <Tag icon={<TrophyOutlined />} color="volcano">
                          Quiz Available 
                        </Tag>
                      )}
                    </Space>
                    <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, marginBottom: 12 }}>
                      {course.description}
                    </Paragraph>

                    <Space size={12}>
                      {enrollmentStatus === "enrolled" ? (
                        <>
                          <Button 
                            type="primary" 
                            size="middle" 
                            icon={<CheckCircleOutlined />}
                            disabled
                            style={{ 
                              backgroundColor: "#52c41a", 
                              borderColor: "#52c41a",
                              fontSize: 14,
                              color: "#ffffff",
                            }}
                          >
                            Enrolled
                          </Button>
                          <Button 
                            type="primary" 
                            size="middle" 
                            icon={<RocketOutlined />}
                            onClick={handleStartLearning}
                            loading={isStartingLearning}
                            style={{ 
                              backgroundColor: "#1890ff", 
                              borderColor: "#1890ff",
                              fontSize: 14,
                            }}
                          >
                            Start Learning
                          </Button>
                          <Button 
                            type="default"
                            size="middle" 
                            icon={<ExperimentOutlined />}
                            onClick={handleStartQuiz}
                            loading={isStartingQuiz}
                            disabled={progress < 80}
                            style={{ 
                              fontSize: 14,
                              backgroundColor: progress >= 80 ? "#faad14" : "#d9d9d9",
                              borderColor: progress >= 80 ? "#faad14" : "#d9d9d9",
                              color: progress >= 80 ? "white" : "black",
                            }}
                          >
                            Start Test {progress < 80 && `(${progress}% Required)`}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            type="primary" 
                            size="middle" 
                            icon={<BookOutlined />}
                            onClick={confirmEnrollmentAndEnroll}
                            loading={enrolling}
                            style={{ 
                              fontSize: 14,
                              backgroundColor: "#1890ff",
                              borderColor: "#1890ff",
                            }}
                          >
                            Enroll Now
                          </Button>
                          <Button 
                            type="default"
                            size="middle" 
                            icon={<RocketOutlined />}
                            onClick={handleStartLearning}
                            style={{ 
                              fontSize: 14,
                            }}
                          >
                            Start Learning
                          </Button>
                          <Button 
                            type="default"
                            size="middle" 
                            icon={<ExperimentOutlined />}
                            onClick={handleStartQuiz}
                            style={{ 
                              fontSize: 14,
                            }}
                          >
                            Start Quiz
                          </Button>
                        </>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Col>

              {/* Right Column - Progress Tracking Card - Pushed to the right */}
              {enrollmentStatus === "enrolled" && (
                <Col xs={24} lg={8}>
                  <div style={{ 
                    display: "flex",
                    justifyContent: "flex-end",
                    height: "100%",
                  }}>
                    <div style={{ 
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: 12,
                      padding: "16px",
                      backdropFilter: "blur(10px)",
                      width: "80%",
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <Text strong style={{ color: "white", fontSize: 14 }}>
                            Your Progress
                          </Text>
                          <Text strong style={{ color: "#ffd700", fontSize: 18 }}>
                            {progress}%
                          </Text>
                        </div>
                        <Progress 
                          percent={progress} 
                          strokeColor="#ffd700"
                          showInfo={false}
                          trailColor="rgba(255,255,255,0.3)"
                          strokeWidth={8}
                        />
                        <div style={{ marginTop: 12, marginBottom: 12 }}>
                          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                            ✅ {completedLessons.length} of {lessons.length} lessons completed
                          </Text>
                        </div>
                        <div style={{ 
                          fontSize: 11, 
                          color: "rgba(255,255,255,0.8)", 
                          fontStyle: "italic",
                          padding: "8px",
                          background: "rgba(0,0,0,0.2)",
                          borderRadius: 8,
                        }}>
                          {getTrackProgressMessage()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </Card>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "0 24px 24px 24px",
      }}>
        <div id="lessons-section">
          <Card 
            style={{ 
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <VideoCameraOutlined style={{ fontSize: 18, color: "#1890ff" }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Course Lessons</span>
                {enrollmentStatus === "enrolled" && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
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
                style={{ marginBottom: 20, borderRadius: 12 }}
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
                  const isCompleted = completedLessons.includes(Number(lesson.id));
                  const canAccess = enrollmentStatus === "enrolled";

                  return (
                    <Panel
                      key={index}
                      header={
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          width: "100%",
                          paddingRight: 20,
                        }}>
                          <Space>
                            {isCompleted ? (
                              <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />
                            ) : (
                              <UnlockOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                            )}
                            <Text strong style={{ fontSize: 14 }}>Lesson {index + 1}: {lesson.title}</Text>
                          </Space>
                          {isCompleted && <Tag color="success" style={{ borderRadius: 12, fontSize: 11 }}>Completed</Tag>}
                        </div>
                      }
                    >
                      <div style={{ padding: "12px 0" }}>
                        <Paragraph style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
                          {lesson.description || "No description available for this lesson."}
                        </Paragraph>

                        <div style={{ marginBottom: 20 }}>
                          <Text strong style={{ fontSize: 14, display: "block", marginBottom: 10 }}>
                            <VideoCameraOutlined style={{ marginRight: 6 }} />
                            Video Content
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            {canAccess && lesson.video_url ? (
                              <video 
                                controls 
                                style={{ width: "100%", borderRadius: 12, maxHeight: 360 }} 
                                src={lesson.video_url}
                                poster={course.thumbnail_url}
                                onEnded={() => handleLessonComplete(Number(lesson.id))}
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : !canAccess ? (
                              <div style={{ 
                                background: "#f5f5f5", 
                                padding: 30, 
                                textAlign: "center", 
                                borderRadius: 12,
                                border: "1px dashed #d9d9d9"
                              }}>
                                <LockOutlined style={{ fontSize: 32, color: "#bfbfbf", marginBottom: 8 }} />
                                <p style={{ margin: 0, color: "#8c8c8c" }}>Enroll in this course to unlock video content</p>
                              </div>
                            ) : (
                              <div style={{ 
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                                padding: 30, 
                                textAlign: "center", 
                                borderRadius: 12,
                                color: "white",
                              }}>
                                <PlayCircleOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                                <p style={{ margin: 0, fontSize: 14 }}>Video content will be added soon</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                          <Text strong style={{ fontSize: 14, display: "block", marginBottom: 10 }}>
                            <FilePdfOutlined style={{ marginRight: 6 }} />
                            Course Material
                          </Text>
                          <div>
                            {canAccess && lesson.material_url ? (
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
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {!canAccess ? "Enroll to access materials" : "No material available for this lesson"}
                              </Text>
                            )}
                          </div>
                        </div>

                        {canAccess && !isCompleted && (
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleLessonComplete(Number(lesson.id))}
                            size="small"
                            style={{ 
                              marginTop: 4,
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
                            style={{ marginTop: 12, borderRadius: 8 }}
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
    </div>
  );
}