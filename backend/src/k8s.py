from kubernetes import client, config
import sys

try:
    config = config.load_incluster_config()
except config.ConfigException as e:
    print(f"Kubernetes API is unreachable: {str(e)}")
    sys.exit(1)
else:
    configuration = client.Configuration.get_default_copy()
    configuration.timeout = 5
    v1 = client.CoreV1Api(client.ApiClient(configuration))
    version_api = client.VersionApi(client.ApiClient(configuration))


def ping_k8s_api():
    """
    Ping the Kubernetes API to verify connectivity.
    Returns version info if successful.
    """
    try:
        version_info = version_api.get_code()
        return {
            "connected": True,
            "git_version": version_info.git_version,
            "platform": version_info.platform
        }
    except client.exceptions.ApiException as e:
        return {
            "connected": False,
            "error": str(e)
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e)
        }


def k8s_list_pod_for_all_namespaces():
    """
    List all pods of all namespaces
    """
    try:
        ret = v1.list_pod_for_all_namespaces(watch=False)

        pods = []
        for i in ret.items:
            pods.append({
                "pod_ip": i.status.pod_ip,
                "namespace": i.metadata.namespace,
                "name": i.metadata.name,
            })

        return pods

    except client.exceptions.ApiException as e:
        return {"error": str(e)}


def k8s_list_event_for_all_namespaces():
    """
    List all events of all namespaces
    """
    try:
        ret = v1.list_event_for_all_namespaces(watch=False)

        events = []
        for e in ret.items:
            events.append({
                "name": e.metadata.name,
                "namespace": e.metadata.namespace,
                "reason": e.reason,
                "message": e.message,
                "type": e.type,
                "event_time": str(e.event_time) if e.event_time else None,
                "first_timestamp": str(e.first_timestamp) if e.first_timestamp else None,
                "last_timestamp": str(e.last_timestamp) if e.last_timestamp else None,
                "involved_object": {
                    "kind": e.involved_object.kind,
                    "name": e.involved_object.name,
                    "namespace": e.involved_object.namespace,
                    "field_path": e.involved_object.field_path,
                }
            })

        return events

    except client.exceptions.ApiException as e:
        return {"error": str(e)}


def k8s_list_service_for_all_namespaces():
    """
    List all services of all namespaces
    """
    try:
        ret = v1.list_service_for_all_namespaces(watch=False)

        services = []
        for s in ret.items:
            services.append({
                "name": s.metadata.name,
                "namespace": s.metadata.namespace,
                "type": s.spec.type,
                "cluster_ip": s.spec.cluster_ip,
                "external_ips": s.spec.external_i_ps,
                "selector": s.spec.selector,
                "ports": [
                    {
                        "name": p.name,
                        "protocol": p.protocol,
                        "port": p.port,
                        "target_port": p.target_port
                    }
                    for p in s.spec.ports or []
                ]
            })

        return services

    except client.exceptions.ApiException as e:
        return {"error": str(e)}
