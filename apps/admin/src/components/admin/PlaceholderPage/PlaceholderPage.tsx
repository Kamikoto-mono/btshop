import { Card, Typography } from 'antd'

export const PlaceholderPage = ({
  description,
  title
}: {
  description: string
  title: string
}) => (
  <Card>
    <Typography.Title level={1}>{title}</Typography.Title>
    <Typography.Paragraph
      style={{
        maxWidth: 720,
        color: '#61758f',
        fontSize: 16,
        lineHeight: 1.7
      }}
    >
      {description}
    </Typography.Paragraph>
  </Card>
)
