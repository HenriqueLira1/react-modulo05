import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../Components/Container';
import {
    Loading,
    Owner,
    IssueList,
    IssueFilter,
    IssuePagination,
} from './styles';

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

    state = {
        repoName: '',
        repository: {},
        issues: [],
        loading: true,
        issueFilter: 'open',
        issuePage: 1,
    };

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`repos/${repoName}`),
            api.get(`repos/${repoName}/issues`),
        ]);

        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
            repoName,
        });
    }

    handleIssueFilter = async e => {
        const issueFilter = e.target.value;

        const { repoName } = this.state;

        const issues = await api.get(
            `repos/${repoName}/issues?state=${issueFilter}`
        );

        this.setState({
            issueFilter,
            issues: issues.data,
        });
    };

    handlePagination = async e => {
        const issuePage = e.target.value;

        const { repoName, issueFilter } = this.state;

        const issues = await api.get(
            `repos/${repoName}/issues?state=${issueFilter}&page=${issuePage}`
        );

        console.log(
            `repos/${repoName}/issues?state=${issueFilter}&page=${issuePage}`
        );

        this.setState({
            issues: issues.data,
            issuePage,
        });
    };

    render() {
        const {
            repository,
            issues,
            loading,
            issueFilter,
            issuePage,
        } = this.state;

        if (loading) {
            return <Loading>Carregando</Loading>;
        }

        return (
            <Container>
                <Owner>
                    <Link to="/">Voltar aos repositórios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>

                <IssueFilter
                    onChange={this.handleIssueFilter}
                    value={issueFilter}
                >
                    <option value="open">Aberta</option>
                    <option value="closed">Fechada</option>
                    <option value="all">Todas</option>
                </IssueFilter>

                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />

                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
                <IssuePagination>
                    <button
                        type="button"
                        onClick={this.handlePagination}
                        value={Number(issuePage) - 1}
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={this.handlePagination}
                        value={Number(issuePage) + 1}
                    >
                        Próxima
                    </button>
                </IssuePagination>
            </Container>
        );
    }
}
