import { useState } from "react";
import {
  Input,
  Button,
  Select,
  Upload,
  Card,
  Space,
  Typography,
  message,
  Divider,
  InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";

const { Title } = Typography;
const { TextArea } = Input;

const API_BASE = "http://127.0.0.1:8000";

export default function AddCourse() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      number_of_lessons: 0,
      lessons: [],
    },
  });

  const lessonCount = watch("number_of_lessons") || 0;
  const lessons = watch("lessons") || [];

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("duration", values.duration);
      formData.append("level", values.level);
      formData.append("description", values.description);
      formData.append(
        "number_of_lessons",
        values.number_of_lessons
      );

      if (
        values.thumbnail &&
        values.thumbnail.length > 0
      ) {
        formData.append(
          "thumbnail",
          values.thumbnail[0].originFileObj
        );
      }

      const lessonData = [];

      for (
        let i = 0;
        i < values.number_of_lessons;
        i++
      ) {
        lessonData.push({
          title: values.lessons?.[i]?.title || "",
          description:
            values.lessons?.[i]?.description || "",
        });
      }

      formData.append(
        "lessons",
        JSON.stringify(lessonData)
      ); 

      values.lessons?.forEach((lesson, index) => {
        if (
          lesson?.material &&
          lesson.material.length > 0
        ) {
          formData.append(
            `lesson_material_${index}`,
            lesson.material[0].originFileObj
          );
        }

        if (
          lesson?.video &&
          lesson.video.length > 0
        ) {
          formData.append(
            `lesson_video_${index}`,
            lesson.video[0].originFileObj
          );
        }
      });

      const response = await fetch(
        `${API_BASE}/api/course/create/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "lms_token"
            )}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success(
          "Course Added Successfully"
        );
        reset();
      } else {
        message.error(
          data.error || "Failed to add course"
        );
      }
    } catch (error) {
      console.error(error);
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-lg rounded-xl">
        <Title level={3}>Add Course</Title>

        <form
          onSubmit={handleSubmit(onSubmit)}
        >

          <div style={{ marginBottom: 20 }}>
            <label>
              Course Thumbnail
            </label>

            <Controller
              name="thumbnail"
              control={control}
              render={({ field }) => (
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  onChange={(info) =>
                    field.onChange(
                      info.fileList
                    )
                  }
                >
                  <Button
                    icon={
                      <UploadOutlined />
                    }
                  >
                    Upload Thumbnail
                  </Button>
                </Upload>
              )}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              Course Title
            </label>

            <Input
              placeholder="Enter course title"
              {...register(
                "title",
                {
                  required: true,
                }
              )}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              Course Category
            </label>

            <Controller
              name="category"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Category"
                >
                  <Select.Option value="Programming">
                    Programming
                  </Select.Option>

                  <Select.Option value="Web Development">
                    Web Development
                  </Select.Option>

                  <Select.Option value="AI">
                    AI
                  </Select.Option>

                  <Select.Option value="Others">
                    Others
                  </Select.Option>
                </Select>
              )}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              Course Duration
            </label>

            <Input
              placeholder="10 Hours"
              {...register(
                "duration",
                {
                  required: true,
                }
              )}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              Course Level
            </label>

            <Controller
              name="level"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Level"
                >
                  <Select.Option value="Beginner">
                    Beginner
                  </Select.Option>

                  <Select.Option value="Intermediate">
                    Intermediate
                  </Select.Option>

                  <Select.Option value="Advanced">
                    Advanced
                  </Select.Option>
                </Select>
              )}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              Description
            </label>

            <TextArea
              rows={4}
              placeholder="Course Description"
              {...register(
                "description",
                {
                  required: true,
                }
              )}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              Number of Lessons
            </label>

            <Controller
              name="number_of_lessons"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  style={{
                    width: "100%",
                  }}
                />
              )}
            />
          </div>         

          {Array.from({
            length: lessonCount,
          }).map((_, index) => (
            <Card
              key={index}
              style={{
                marginBottom: 20,
              }}
              title={`Lesson ${
                index + 1
              }`}
            >
              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <label>
                  Lesson Title
                </label>

                <Input
                  placeholder="Lesson Title"
                  {...register(
                    `lessons.${index}.title`,
                    {
                      required: true,
                    }
                  )}
                />
              </div>

              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <label>
                  Lesson Description
                </label>

                <TextArea
                  rows={3}
                  placeholder="Lesson Description"
                  {...register(
                    `lessons.${index}.description`,
                    {
                      required: true,
                    }
                  )}
                />
              </div>

              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <label>
                  Course Material
                </label>

                <Controller
                  name={`lessons.${index}.material`}
                  control={control}
                  render={({
                    field,
                  }) => (
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      onChange={(
                        info
                      ) =>
                        field.onChange(
                          info.fileList
                        )
                      }
                    >
                      <Button
                        icon={
                          <UploadOutlined />
                        }
                      >
                        Upload Material
                      </Button>
                    </Upload>
                  )}
                />
              </div>

              {/* Video */}

              <div>
                <label>
                  Video
                </label>

                <Controller
                  name={`lessons.${index}.video`}
                  control={control}
                  render={({
                    field,
                  }) => (
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      onChange={(
                        info
                      ) =>
                        field.onChange(
                          info.fileList
                        )
                      }
                    >
                      <Button
                        icon={
                          <UploadOutlined />
                        }
                      >
                        Upload Video
                      </Button>
                    </Upload>
                  )}
                />
              </div>
            </Card>
          ))}

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Upload Course
            </Button>
          </Space>
        </form>
      </Card>
    </div>
  );
}