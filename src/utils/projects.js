export const getProjectOrder = (project, fallbackIndex = 0) => {
  const order = Number(project?.order)
  return Number.isFinite(order) && order > 0 ? order : fallbackIndex + 1
}

export const sortProjects = (projects = []) => (
  projects
    .map((project, index) => ({ project, index }))
    .sort((first, second) => {
      const firstOrder = getProjectOrder(first.project, first.index)
      const secondOrder = getProjectOrder(second.project, second.index)

      if (firstOrder !== secondOrder) return firstOrder - secondOrder
      return String(first.project.title || '').localeCompare(String(second.project.title || ''))
    })
    .map(({ project }) => project)
)
