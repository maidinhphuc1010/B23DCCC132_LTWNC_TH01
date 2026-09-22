/* eslint-disable @typescript-eslint/no-use-before-define */
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Form, Input, Radio, Row, Select, Space, Spin, Tag, Typography, message } from 'antd';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { addAssignment, fetchAssignments, getDateDiff, priorityLabels, removeAssignment, store, toggleAssignment, useAppDispatch, useAppSelector, useAssignmentFilters } from '@/features/assignments';
import type { Assignment, AssignmentStatus, NewAssignment, Priority } from '@/features/assignments';
import './style.less';

const { Title, Text } = Typography;

interface FilterItemProps { value: AssignmentStatus; label: string; onSelect: (value: AssignmentStatus) => void; }
const AssignmentFiltersItem = ({ value, label, onSelect }: FilterItemProps) => <Radio.Button value={value} onClick={() => onSelect(value)}>{label}</Radio.Button>;
const AssignmentFiltersRoot = ({ value, onChange }: { value: AssignmentStatus; onChange: (value: AssignmentStatus) => void }) => (
  <div className='assignment-filters'><Text strong>Lọc trạng thái</Text><Radio.Group value={value} optionType='button' buttonStyle='solid'>
    <AssignmentFilters.Item value='all' label='Tất cả' onSelect={onChange} />
    <AssignmentFilters.Item value='pending' label='Chưa hoàn thành' onSelect={onChange} />
    <AssignmentFilters.Item value='overdue' label='Quá hạn' onSelect={onChange} />
    <AssignmentFilters.Item value='completed' label='Đã hoàn thành' onSelect={onChange} />
  </Radio.Group></div>
);
const AssignmentFilters = Object.assign(AssignmentFiltersRoot, { Item: AssignmentFiltersItem });

const AssignmentForm = () => {
  const [form] = Form.useForm<NewAssignment>();
  const dispatch = useAppDispatch();
  const submit = (values: NewAssignment) => { dispatch(addAssignment(values)); form.resetFields(); message.success('Đã thêm bài tập mới'); };
  return <Card className='assignment-form' title={<span><PlusOutlined /> Thêm bài tập</span>} bordered={false}>
    <Form form={form} layout='vertical' onFinish={submit} initialValues={{ priority: 'medium' as Priority }}>
      <Row gutter={16}>
        <Col xs={24} md={6}><Form.Item name='subject' label='Môn học' rules={[{ required: true, message: 'Nhập môn học' }]}><Input placeholder='Ví dụ: TypeScript' /></Form.Item></Col>
        <Col xs={24} md={9}><Form.Item name='title' label='Tên bài tập' rules={[{ required: true, message: 'Nhập tên bài tập' }]}><Input placeholder='Nhập tên bài tập' /></Form.Item></Col>
        <Col xs={24} md={5}><Form.Item name='dueDate' label='Hạn nộp' rules={[{ required: true, message: 'Chọn hạn nộp' }]}><Input type='date' /></Form.Item></Col>
        <Col xs={24} md={4}><Form.Item name='priority' label='Ưu tiên'><Select options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))} /></Form.Item></Col>
      </Row>
      <Button type='primary' htmlType='submit' icon={<PlusOutlined />}>Thêm bài tập</Button>
    </Form>
  </Card>;
};

const AssignmentList = () => {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.assignments);
  const { status: filter, setStatus, filteredAssignments } = useAssignmentFilters(items);
  useEffect(() => { if (status === 'idle') dispatch(fetchAssignments()); }, [dispatch, status]);
  return <>
    <div className='list-toolbar'><div><Title level={4}>Danh sách bài tập <Tag color='blue'>{filteredAssignments.length}</Tag></Title><Text type='secondary'>Theo dõi tiến độ học tập của bạn</Text></div><Space><AssignmentFilters value={filter} onChange={setStatus} /><Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchAssignments())}>Tải lại</Button></Space></div>
    {status === 'loading' && <div className='loading'><Spin tip='Đang tải bài tập mẫu...' /></div>}
    {error && <Text type='danger'>{error}</Text>}
    {status !== 'loading' && filteredAssignments.length === 0 && <Empty description='Không có bài tập phù hợp' />}
    <div className='assignment-list'>{filteredAssignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} onToggle={() => dispatch(toggleAssignment(assignment.id))} onRemove={() => dispatch(removeAssignment(assignment.id))} />)}</div>
  </>;
};

const AssignmentCard = ({ assignment, onToggle, onRemove }: { assignment: Assignment; onToggle: () => void; onRemove: () => void }) => {
  const days = getDateDiff(assignment.dueDate);
  const overdue = !assignment.completed && days < 0;
  return <Card className={`assignment-card ${assignment.completed ? 'is-completed' : ''}`} bordered={false}>
    <div className='assignment-main'><div className='assignment-subject'>{assignment.subject}</div><Title level={5} className='assignment-title'>{assignment.title}</Title><Text type='secondary'>Hạn nộp: {new Date(`${assignment.dueDate}T00:00:00`).toLocaleDateString('vi-VN')}</Text></div>
    <div className='assignment-meta'><Tag color={assignment.priority === 'high' ? 'red' : assignment.priority === 'medium' ? 'orange' : 'green'}>{priorityLabels[assignment.priority]}</Tag><Text className={overdue ? 'overdue' : assignment.completed ? 'done' : 'remaining'}>{assignment.completed ? 'Đã hoàn thành' : overdue ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`}</Text></div>
    <Space><Button size='small' type={assignment.completed ? 'default' : 'primary'} onClick={onToggle}>{assignment.completed ? 'Bỏ hoàn thành' : 'Hoàn thành'}</Button><Button danger type='text' icon={<DeleteOutlined />} aria-label='Xóa bài tập' onClick={onRemove} /></Space>
  </Card>;
};

const Dashboard = () => <Provider store={store}><DashboardContent /></Provider>;
const DashboardContent = () => { const completed = useAppSelector((state) => state.assignments.items.filter((item) => item.completed).length); return <div className='assignment-page'><div className='hero'><div><Text className='eyebrow'>PERSONAL LEARNING PLANNER</Text><Title>Bài tập của tôi</Title><Text className='hero-description'>Quản lý deadline, ưu tiên và tiến độ học tập trong một nơi.</Text></div><div className='hero-stat'><span>{completed}</span><Text>đã hoàn thành</Text></div></div><AssignmentForm /><AssignmentList /></div>; };

export default Dashboard;

