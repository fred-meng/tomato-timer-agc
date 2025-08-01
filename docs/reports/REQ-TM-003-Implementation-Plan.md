# REQ-TM-003: 编辑任务实现计划

## 验收测试完备性检查结果

### 总体覆盖度: 85%

#### ✅ 完全覆盖的需求:
- **REQ-TM-003.1 (编辑入口)**: 100% 覆盖
- **REQ-TM-003.2 (编辑内容)**: 85% 覆盖  
- **REQ-TM-003.3 (保存生效)**: 80% 覆盖

#### ⚠️ 需要补充的验收条件:

1. **数据预填充测试**:
   - AC-TM-003.2.7: 编辑模式下所有字段应预填充当前值
   - AC-TM-003.2.8: 修改字段后应实时更新状态

2. **数据持久化测试**:
   - AC-TM-003.3.7: 编辑后数据应持久化到localStorage
   - AC-TM-003.3.8: 页面刷新后修改应保持

3. **用户体验测试**:
   - AC-TM-003.3.9: 编辑过程中应有加载状态指示
   - AC-TM-003.3.10: 编辑成功后应有视觉反馈

## 实现步骤

### 第1步: 扩展TaskForm组件支持编辑模式

**目标**: 让TaskForm组件接受`editingTask`属性并预填充表单

**需要修改的文件**:
- `src/components/TaskForm.tsx`
- `src/lib/store.ts` (确保updateTask方法存在)

**关键功能**:
```typescript
interface TaskFormProps {
  editingTask?: Task;
  onClose?: () => void;
}

const TaskForm = ({ editingTask, onClose }: TaskFormProps) => {
  // 根据editingTask预填充表单状态
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  // ... 其他字段
}
```

### 第2步: 实现编辑入口

**目标**: 在TaskItem组件中添加编辑按钮功能

**需要修改的文件**:
- `src/components/TaskItem.tsx`
- `src/components/TasksTab.tsx` (管理编辑状态)

**关键功能**:
- 编辑按钮点击处理
- 打开编辑模态框或表单
- 传递当前任务数据到编辑表单

### 第3步: 完善store的updateTask方法

**目标**: 确保updateTask方法正确更新任务并触发UI更新

**需要修改的文件**:
- `src/lib/store.ts`

**关键功能**:
```typescript
updateTask: (id: string, updates: Partial<Task>) => {
  set(state => ({
    tasks: state.tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    )
  }))
}
```

### 第4步: 添加缺失的验收测试

**需要补充的测试文件**:
- 数据预填充测试
- 持久化测试  
- 边界值测试补充

### 第5步: 修复测试环境

**目标**: 解决React版本冲突问题

**可能的解决方案**:
1. 更新package.json中的React版本兼容性
2. 配置Jest mock更好地处理React hooks
3. 使用React 18兼容的测试工具

## 验收标准

### 功能验收标准:
- [ ] 任务列表中每个任务都有编辑入口
- [ ] 点击编辑按钮打开预填充的编辑表单
- [ ] 所有字段都可以修改（标题、描述、预估番茄数、优先级）
- [ ] 保存修改后立即在列表中反映变化
- [ ] 取消编辑丢弃所有修改
- [ ] 数据验证与创建任务保持一致

### 技术验收标准:
- [ ] 所有验收测试通过
- [ ] 代码覆盖率 ≥ 90%
- [ ] 符合iOS 18设计规范
- [ ] 支持键盘导航
- [ ] 响应式设计适配移动端

### 性能验收标准:
- [ ] 编辑表单打开时间 < 100ms
- [ ] 保存操作响应时间 < 200ms
- [ ] 无内存泄漏
- [ ] 流畅的动画过渡效果

## 风险评估

### 高风险项:
1. **测试环境配置**: React版本冲突可能影响开发效率
2. **状态管理复杂性**: 编辑状态与列表状态同步

### 中风险项:
1. **用户体验一致性**: 编辑界面与创建界面保持一致
2. **数据验证**: 确保编辑时的验证规则正确

### 低风险项:
1. **UI组件复用**: 可以复用现有的TaskForm组件
2. **存储机制**: 已有的Zustand persist机制可以直接使用

## 下一步行动

### 立即行动项:
1. 修复测试环境的React版本冲突问题
2. 扩展TaskForm组件支持编辑模式
3. 在TaskItem中添加编辑按钮功能

### 后续行动项:
1. 实现完整的编辑流程
2. 补充缺失的验收测试
3. 进行端到端测试验证

## 预计时间线

- **第1-2步** (TaskForm扩展 + 编辑入口): 2-3小时
- **第3步** (store完善): 1小时  
- **第4步** (补充测试): 2小时
- **第5步** (修复测试环境): 1-2小时

**总估计**: 6-8小时完成全部实现和测试
