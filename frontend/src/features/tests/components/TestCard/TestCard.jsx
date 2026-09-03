import React from 'react'
import TestCardHeader from './TestCardHeader'
import TestCardContent from './TestCardContent'
import TestCardBadges from './TestCardBadges'
import TestCardFooter from './TestCardFooter'

const getTitle = (test) => test.title || test.name || test.testName || 'Untitled Test'
const getCategory = (test) => test.category?.name || test.category || 'Uncategorised'
const isActiveTest = (test) => test.isActive !== false && test.status?.toLowerCase() !== 'inactive'
const getValue = (test, keys, fallback = '—') => keys.map((key) => test[key]).find((value) => value != null && value !== '') ?? fallback

const TestCard = ({
  test,
  isPatient,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onBook,
}) => {
  const testName = getTitle(test)
  const testCode = test.code || test.testCode || '—'
  const iconName = test.icon?.name || test.category?.icon || 'flask'
  const category = getCategory(test)
  const sampleType = getValue(test, ['sampleType', 'sample'], 'Blood')
  const method = getValue(test, ['method'], null)
  const price = getValue(test, ['price'], null)
  const reportTime = getValue(test, ['reportTime', 'tat', 'turnaroundTime'], null)
  const active = isActiveTest(test)

  return (
    <article
      onClick={() => onView?.(test)}
      className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md cursor-pointer"
    >
      <TestCardHeader
        testName={testName}
        testCode={testCode}
        iconName={iconName}
      />

      <TestCardContent
        category={category}
        sampleType={sampleType}
        method={method}
        price={price}
        reportTime={reportTime}
      />

      <TestCardBadges isActive={active} />

      <TestCardFooter
        test={test}
        isPatient={isPatient}
        onView={onView}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onBook={onBook}
      />
    </article>
  )
}

export default TestCard
