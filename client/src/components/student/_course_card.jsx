import { Card, Tag, Typography, Space } from "antd";

const { Text } = Typography;

export default function CourseCard({
  course,
  enrollmentMeta,
  completionMeta,
  progressMeta,
}) {
  if (!course) return null;

  const {
    title,
    thumbnail_url,
    category,
    duration,
    level,
    description,
    course_title,
    course_category,
    course_duration,
    course_level,
    course_description,
  } = course;

  const displayTitle = title || course_title || "Untitled";

  const resolvedCategory = category || course_category;
  const resolvedDuration = duration ?? course_duration;
  const resolvedLevel = level || course_level;
  const resolvedDescription = description || course_description;


  return (
    <Card
      hoverable
      style={{ width: "100%" }}
      cover={
        thumbnail_url ? (
          <img
            alt={displayTitle}
            src={thumbnail_url}
            style={{ height: 180, objectFit: "cover" }}
          />
        ) : null
      }
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <div>
          <Text strong style={{ fontSize: 16 }}>
            {displayTitle}
          </Text>
        </div>

        <Space wrap>
          {resolvedCategory ? <Tag>{resolvedCategory}</Tag> : null}
          {resolvedLevel ? <Tag color="purple">{resolvedLevel}</Tag> : null}
          {resolvedDuration !== undefined && resolvedDuration !== null ? (
            <Tag color="blue">{resolvedDuration} mins</Tag>
          ) : null}

        </Space>

        {enrollmentMeta?.status ? (
          <Tag color={enrollmentMeta.status === "completed" ? "green" : "blue"}>
            {enrollmentMeta.status}
          </Tag>
        ) : null}

        {completionMeta?.completed_date ? (
          <Text type="secondary">
            Completed on: {completionMeta.completed_date}
          </Text>
        ) : null}
        {enrollmentMeta?.enrolled_at ? (
          <Text type="secondary">Enrolled on: {enrollmentMeta.enrolled_at}</Text>
        ) : null}

        {completionMeta?.tutor_details ? (
          <Text type="secondary">Tutor: {completionMeta.tutor_details}</Text>
        ) : null}

        {progressMeta?.progress_percentage !== undefined ? (
          <Text>
            Progress: {progressMeta.progress_percentage}% ({progressMeta.completed_lessons}/
            {progressMeta.total_lessons})
          </Text>
        ) : null}

        {resolvedDescription ? (
          <Text type="secondary" style={{ display: "block" }}>
            {resolvedDescription}
          </Text>
        ) : null}

      </Space>
    </Card>
  );
}

